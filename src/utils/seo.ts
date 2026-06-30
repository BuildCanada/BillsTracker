import { env } from "@/env";
import { BUILD_CANADA_BILLS_ORIGIN } from "@/consts/general";

/**
 * Deterministic canonical origin for the bills app. Prefers the deployment's
 * NEXT_PUBLIC_APP_URL, falling back to the public Build Canada origin so that
 * sitemap/robots/canonical URLs are always absolute and stable (request-host
 * fallbacks would otherwise leak preview/localhost hosts into indexable output).
 */
export function getCanonicalOrigin(): string {
  return (env.NEXT_PUBLIC_APP_URL || BUILD_CANADA_BILLS_ORIGIN).replace(
    /\/$/,
    "",
  );
}

/**
 * Strip common Markdown syntax and collapse whitespace so AI-generated summaries
 * read cleanly as a plain-text meta description.
 */
export function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/[*_~>#]/g, "") // emphasis / blockquote / heading marks
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncate to `max` characters at a word boundary, appending an ellipsis when cut.
 */
export function truncate(input: string, max: number): string {
  const text = input.trim();
  if (text.length <= max) return text;
  const slice = text.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice)
    .replace(/[\s.,;:]+$/, "")
    .trim();
  return `${trimmed}…`;
}
