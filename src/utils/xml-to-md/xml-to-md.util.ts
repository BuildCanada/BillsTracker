// bill-xml-to-md.ts
import { XMLParser } from "fast-xml-parser";

/**
 * With preserveOrder=true, each node is an object like:
 * { TagName: NodeList, ":@": { "@attr": "value", ... } }
 * or a text node: { "#text": "..." }
 */
export type XMLNode = Record<string, unknown>;
export type NodeList = XMLNode[];

export function xmlToMarkdown(xmlString: string): string {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@",   // attributes look like "@level", "@href", etc (inside :@)
    preserveOrder: true,        // we need ordering and mixed content
    trimValues: false,
  });

  // Strip BOM/newlines that often show up in downloaded XML
  const cleaned = xmlString.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const ast = parser.parse(cleaned) as NodeList;

  const md = renderNodes(ast).replace(/\n{3,}/g, "\n\n").trim();
  return md.length ? md + "\n" : md;
}

/* ============================ Rendering Core ============================ */

type Ctx = { olDepth: number; listMode: "none" | "ul" | "ol" };
const defaultCtx = (): Ctx => ({ olDepth: 0, listMode: "none" });

function renderNodes(nodes: NodeList, ctx: Ctx = defaultCtx()): string {
  return nodes.map(n => renderNode(n, ctx)).join("");
}

function renderNode(node: XMLNode, ctx: Ctx): string {
  // Text node
  if ("#text" in node) return String(node["#text"]);

  const tag = getTagName(node);
  if (!tag) return "";

  const children = getChildren(node, tag);
  const attrs = getAttributes(node);

  switch (tag) {
    /* ===== Top-level Bill shaping ===== */
    case "bill": {
      // Build a compact header from <Identification>
      const identification = findChild(children, "identification");
      const billNo = identification ? findText(identification, "billnumber") : "";
      const longTitle = identification ? findText(identification, "longtitle") : "";
      const sponsor = identification ? findText(identification, "billsponsor") : "";
      const dateStr = extractFirstReadingDate(identification);

      const headerLines: string[] = [];
      if (billNo || longTitle) headerLines.push(`# ${[billNo, longTitle].filter(Boolean).join(" — ")}`);
      if (sponsor) headerLines.push(`**Sponsor:** ${sponsor}`);
      if (dateStr) headerLines.push(`**Introduced:** ${dateStr}`);

      // Render everything except <Identification> (to avoid duplication)
      const rest = children.filter(c => getTagName(c) !== "identification");
      return [headerLines.join("\n"), renderNodes(rest, ctx)].filter(Boolean).join("\n\n") + "\n";
    }

    /* ===== Structural containers ===== */
    case "identification":
      // We render Identification inside <bill> already; skip here.
      return "";
    case "introduction":
      // Let Summary/Preamble render their own headings; otherwise just pass through.
      return renderNodes(children, ctx);
    case "summary": {
      // Show a Summary section; skip TitleText="SUMMARY" heading duplicate
      const body = renderNodes(children.filter(c => getTagName(c) !== "titletext"), ctx);
      return `\n## Summary\n\n${body}\n`;
    }
    case "preamble": {
      return `\n## Preamble\n\n${renderNodes(children, ctx)}\n`;
    }

    /* ===== Headings / TitleText ===== */
    case "heading": {
      // <Heading level="1"><TitleText>...</TitleText></Heading>
      const level = Number(attrs.level ?? 1);
      const title = findText(children, "titletext") || inline(children, ctx);
      // Optional marginal/historical notes rendered inline after em-dash
      const note = findText(children, "marginalnote");
      const h = "#".repeat(Math.max(1, Math.min(6, level)));
      return `\n${h} ${[title, note && `— ${note}`].filter(Boolean).join("")}\n\n`;
    }
    case "titletext":
      // Usually consumed by <heading>, but elsewhere it's useful text (e.g., Summary label)
      return inline(children, ctx);

    /* ===== Sections / Subsections ===== */
    case "section": {
      const label = findText(children, "label");
      const marginal = findText(children, "marginalnote");
      const head = (label || marginal)
        ? `\n### ${[label, marginal].filter(Boolean).join(". ")}\n\n`
        : "";

      const textBlocks = collectAll(children, "text").map(t => `${t}\n\n`).join("");

      // Subsections
      const subSecs = children
        .filter(c => getTagName(c) === "subsection")
        .map(ss => renderSubsection(getChildren(ss, "subsection"), ctx))
        .join("");

      // Amended text / nested content
      const amended = children
        .filter(c => getTagName(c) === "amendedtext" || getTagName(c) === "sectionpiece")
        .map(n => renderNodes([n], ctx))
        .join("");

      // Other children (excluding the ones we handled) to avoid duplication
      const leftovers = children.filter(c => {
        const t = getTagName(c);
        return t !== "label" && t !== "marginalnote" && t !== "text" && t !== "subsection" && t !== "amendedtext";
      });

      return `${head}${textBlocks}${subSecs}${renderNodes(leftovers, ctx)}${amended}`;
    }
    case "subsection":
      // Usually handled by parent <section>, but render gracefully if alone
      return renderSubsection(children, ctx);

    /* ===== Paragraph/Provision (amendment pieces) ===== */
    case "paragraph": {
      const lbl = findText(children, "label");
      const mn = findText(children, "marginalnote");
      const t = findText(children, "text") || inline(children, ctx);
      const head = [lbl, mn].filter(Boolean).join(" ");
      return head ? `- **${head}** ${t}\n` : `- ${t}\n`;
    }
    case "provision": {
      // In Summary/Preamble: prefer the <Text> child
      const t = findText(children, "text");
      if (t) return `${t}\n\n`;
      return renderNodes(children, ctx);
    }

    /* ===== Inline formatting & references ===== */
    case "marginalnote":
      return `_${inline(children, ctx)}_`;
    case "historicalnote":
      return `(${inline(children, ctx)})`;
    case "emphasis": {
      const style = (attrs.style || "").toString().toLowerCase();
      const content = inline(children, ctx);
      if (style === "smallcaps") return content.toUpperCase();
      return `*${content}*`;
    }
    case "sup":
      // Markdown has no standard superscript; keep plain
      return inline(children, ctx);
    case "xrefexternal": {
      // <XRefExternal reference-type="act">Act Name</XRefExternal>
      return `_${inline(children, ctx)}_`;
    }

    /* ===== Generic HTML-ish bits (if they appear) ===== */
    case "b":
    case "strong":
      return `**${inline(children, ctx)}**`;
    case "i":
    case "em":
      return `*${inline(children, ctx)}*`;
    case "code":
      return "`" + inline(children, ctx) + "`";
    case "a": {
      const href = (attrs.href || attrs.url || "").toString();
      const txt = inline(children, ctx) || href;
      return href ? `[${txt}](${href})` : txt;
    }

    /* ===== Fallback ===== */
    default:
      return renderNodes(children, ctx);
  }
}

/* ============================ Small Render Helpers ============================ */

function renderSubsection(children: NodeList, ctx: Ctx): string {
  const lbl = findText(children, "label");
  const t = findText(children, "text") || inline(children, ctx);
  return lbl ? `**${lbl}** ${t}\n\n` : `${t}\n\n`;
}

function inline(nodes: NodeList, ctx: Ctx): string {
  return renderNodes(nodes, ctx).replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
}

function collectAll(nodes: NodeList, tag: string): string[] {
  const out: string[] = [];
  for (const n of nodes) {
    const t = getTagName(n);
    if (!t) continue;
    if (t === tag) out.push(textContent(getChildren(n, tag)));
  }
  return out;
}

function textContent(nodes: NodeList): string {
  // Keep line breaks inside <Text> blocks but normalize CRLF
  return renderNodes(nodes).replace(/\r?\n/g, "\n").trim();
}

/* ============================ Tree Navigation ============================ */

function getTagName(node: XMLNode): string | null {
  for (const k of Object.keys(node)) {
    if (k === "#text" || k === ":@") continue;
    return k.toLowerCase();
  }
  return null;
}

function getChildren(node: XMLNode, tagName: string): NodeList {
  const v = (node as any)[Object.keys(node).find(k => k.toLowerCase() === tagName)!];
  return Array.isArray(v) ? (v as NodeList) : [];
}

function getAttributes(node: XMLNode): Record<string, string> {
  const out: Record<string, string> = {};
  // Attributes live under the special ":@" key when preserveOrder=true
  const attrBucket = (node as any)[":@"] as Record<string, unknown> | undefined;
  if (attrBucket) {
    for (const [k, v] of Object.entries(attrBucket)) {
      if (k.startsWith("@")) out[k.slice(1)] = String(v);
      else out[k] = String(v);
    }
  }
  // Also accept attrs on the node itself (if preserveOrder wasn't used upstream)
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("@")) out[k.slice(1)] = String(v);
  }
  return out;
}

function findChild(nodes: NodeList, tag: string): NodeList | null {
  for (const n of nodes) {
    const t = getTagName(n);
    if (t === tag) return getChildren(n, t);
  }
  return null;
}

function findText(nodes: NodeList, tag: string): string {
  const child = findChild(nodes, tag);
  return child ? textContent(child) : "";
}

/* ===== Schema-specific helper ===== */

function extractFirstReadingDate(ident: NodeList | null): string {
  if (!ident) return "";
  const hist = findChild(ident, "billhistory");
  if (!hist) return "";
  const stages = findChild(hist, "stages");
  if (!stages) return "";
  const date = findChild(stages, "date");
  if (!date) return "";

  const yyyy = findText(date, "yyyy");
  const mm = findText(date, "mm");
  const dd = findText(date, "dd");
  if (!yyyy || !mm || !dd) return "";
  const pad = (s: string) => s.padStart(2, "0");
  return `${yyyy}-${pad(mm)}-${pad(dd)}`;
}