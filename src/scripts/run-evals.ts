#!/usr/bin/env tsx

/**
 * Bill-analysis eval harness.
 *
 *   npm run eval            # deterministic checks against the golden dataset
 *   npm run eval -- --judge # also run an LLM-as-judge faithfulness score
 *
 * For each golden bill: fixture XML → markdown → summarizeBillText (real OpenAI
 * call) → score. Deterministic checks are free; the optional judge adds one
 * extra model call per bill. Needs OPENAI_API_KEY (loaded from .env.local/.env).
 *
 * This is intentionally NOT wired into CI — it costs money and hits the network.
 * CI runs the fast, mocked unit tests in tests/unit instead.
 */
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

import fs from "node:fs";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { xmlToMarkdown } from "@/utils/xml-to-md/xml-to-md.util";
import { summarizeBillText } from "@/services/billApi";
import { BillAnalysisSchema } from "@/prompt/schema";
import { checkAnalysisGuardrails } from "@/utils/analysis-guardrails/analysis-guardrails.util";
import { getOpenAI, hasOpenAIKey } from "@/lib/openai";
import { BILL_ANALYSIS_MODEL } from "@/consts/general";
import { GOLDEN_BILLS } from "../../evals/golden";

const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures");
const RESULTS_DIR = path.join(process.cwd(), "evals", "results");

const JudgeSchema = z.object({
  faithfulness: z.number().int().min(1).max(5),
  rationale: z.string(),
});

async function judgeFaithfulness(
  billText: string,
  summary: string,
): Promise<z.infer<typeof JudgeSchema>> {
  const prompt = `You are grading whether a summary faithfully reflects a bill's text.
Score 1 (fabricated/misleading) to 5 (fully accurate, no hallucinations).

BILL TEXT:
${billText.slice(0, 12000)}

SUMMARY:
${summary}`;
  const response = await getOpenAI().responses.parse({
    model: BILL_ANALYSIS_MODEL,
    input: prompt,
    text: { format: zodTextFormat(JudgeSchema, "faithfulness_judgment") },
  });
  if (!response.output_parsed) throw new Error("Judge returned no output");
  return response.output_parsed;
}

async function main() {
  const withJudge = process.argv.includes("--judge");

  if (!hasOpenAIKey()) {
    console.error("OPENAI_API_KEY is not set. Add it to .env.local or .env.");
    process.exit(1);
  }

  const results: unknown[] = [];
  let passed = 0;
  let failed = 0;

  for (const golden of GOLDEN_BILLS) {
    const xmlPath = path.join(FIXTURES_DIR, `${golden.fixture}.xml`);
    if (!fs.existsSync(xmlPath)) {
      console.warn(`SKIP ${golden.billId}: fixture ${xmlPath} not found`);
      continue;
    }

    const markdown = xmlToMarkdown(fs.readFileSync(xmlPath, "utf-8"));
    console.log(`\n=== ${golden.billId} ===`);

    const failures: string[] = [];
    let analysis: Awaited<ReturnType<typeof summarizeBillText>> | null = null;
    try {
      analysis = await summarizeBillText(markdown);
    } catch (error) {
      failures.push(`analysis threw: ${(error as Error).message}`);
    }

    if (analysis) {
      // Schema (belt-and-suspenders; the call already enforces it).
      if (!BillAnalysisSchema.safeParse(analysis).success) {
        failures.push("output failed schema validation");
      }
      // Exactly 8 tenet evaluations.
      if (analysis.tenet_evaluations.length !== 8) {
        failures.push(
          `expected 8 tenet evaluations, got ${analysis.tenet_evaluations.length}`,
        );
      }
      // Judgment.
      if (
        golden.expectedJudgment !== "any" &&
        analysis.final_judgment !== golden.expectedJudgment
      ) {
        failures.push(
          `final_judgment: expected ${golden.expectedJudgment}, got ${analysis.final_judgment}`,
        );
      }
      // Social-issue classification.
      if (analysis.is_social_issue !== golden.expectedSocialIssue) {
        failures.push(
          `is_social_issue: expected ${golden.expectedSocialIssue}, got ${analysis.is_social_issue}`,
        );
      }
      // Must-mention facts.
      const lowerSummary = analysis.summary.toLowerCase();
      for (const phrase of golden.mustMention) {
        if (!lowerSummary.includes(phrase.toLowerCase())) {
          failures.push(`summary missing required mention: "${phrase}"`);
        }
      }
      // Guardrails.
      const guardrail = checkAnalysisGuardrails({
        summary: analysis.summary,
        rationale: analysis.rationale,
        steel_man: analysis.steel_man,
        questions: analysis.question_period_questions,
      });
      for (const v of guardrail) failures.push(`guardrail ${v}`);
    }

    let judge: z.infer<typeof JudgeSchema> | null = null;
    if (withJudge && analysis) {
      try {
        judge = await judgeFaithfulness(markdown, analysis.summary);
        if (judge.faithfulness < 4) {
          failures.push(
            `faithfulness ${judge.faithfulness}/5: ${judge.rationale}`,
          );
        }
      } catch (error) {
        failures.push(`judge threw: ${(error as Error).message}`);
      }
    }

    const ok = failures.length === 0;
    ok ? passed++ : failed++;
    console.log(ok ? "PASS" : "FAIL");
    for (const f of failures) console.log(`  - ${f}`);
    if (judge) console.log(`  faithfulness: ${judge.faithfulness}/5`);

    results.push({
      billId: golden.billId,
      ok,
      failures,
      judge,
      final_judgment: analysis?.final_judgment,
      is_social_issue: analysis?.is_social_issue,
    });
  }

  console.log(`\n${passed} passed, ${failed} failed`);

  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(RESULTS_DIR, `${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Wrote ${outPath}`);

  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
