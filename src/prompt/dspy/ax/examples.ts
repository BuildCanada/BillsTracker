import { promises as fs } from "node:fs";
import path from "node:path";
import { getBillMarkdown } from "@/prompt/utils";

export type ExpectedFinal = "yes" | "no" | "neutral";
export type ExpectedSocial = "yes" | "no";

type Golden = {
  bill_number: string;
  final_judgment: ExpectedFinal;
  is_social_issue: ExpectedSocial;
  rationale?: string;
};

export type AxExample = {
  input: { billText: string };
  label: {
    expectedFinal: ExpectedFinal;
    expectedSocial: ExpectedSocial;
    rationale: string;
  };
};

export const MAX_BILL_TEXT_CHARS = 20000;

function truncate(text: string, max = MAX_BILL_TEXT_CHARS): string {
  const s = typeof text === "string" ? text : "";
  return s.length > max ? s.slice(0, max) : s;
}

async function readGoldens(): Promise<Golden[]> {
  const filePath = path.resolve("src/prompt/dspy/ax/goldens.json");
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("goldens.json is not an array");
  }
  // Basic validation and normalization
  return parsed.map((g) => ({
    bill_number: String((g as any).bill_number ?? ""),
    final_judgment: String(
      (g as any).final_judgment ?? "",
    ).toLowerCase() as ExpectedFinal,
    is_social_issue: String(
      (g as any).is_social_issue ?? "",
    ).toLowerCase() as ExpectedSocial,
    rationale:
      typeof (g as any).rationale === "string" ? (g as any).rationale : "",
  }));
}

export async function loadExamples(): Promise<AxExample[]> {
  const goldens = await readGoldens();

  const rows = await Promise.all(
    goldens.map(async (g) => {
      let billText = "";
      try {
        const md = await getBillMarkdown(g.bill_number);
        billText = truncate(md ?? "");
      } catch (err) {
        console.warn(
          `[ax/examples] Unable to fetch markdown for ${g.bill_number}:`,
          err,
        );
        billText = "";
      }
      const example: AxExample = {
        input: { billText },
        label: {
          expectedFinal: g.final_judgment,
          expectedSocial: g.is_social_issue,
          rationale: g.rationale ?? "",
        },
      };
      return example;
    }),
  );

  return rows;
}

export default loadExamples;
