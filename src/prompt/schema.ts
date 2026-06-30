import { z } from "zod";

/**
 * Single source of truth for the shape of an AI bill analysis.
 *
 * This Zod schema is passed to OpenAI Structured Outputs (via `zodTextFormat`)
 * so the model is *forced* to return JSON matching it exactly — no hand-parsing
 * or regex fallback.
 *
 * The model does NOT emit each tenet's `title` (it's wasted tokens and a
 * hallucination surface). `summarizeBillText` joins the canonical title from
 * `TENETS` by id after parsing, so the `BillAnalysis` type below — what callers
 * actually consume — carries the title while the model output omits it.
 *
 * Note: every field is required (no `.optional()`) because OpenAI strict
 * structured outputs require all keys to be present.
 */
export const ModelTenetEvaluationSchema = z.object({
  id: z.number().int(),
  alignment: z.enum(["aligns", "conflicts", "neutral"]),
  explanation: z.string(),
});

export const QuestionSchema = z.object({
  question: z.string(),
});

/** The schema the model is constrained to (no tenet titles). */
export const BillAnalysisSchema = z.object({
  summary: z.string(),
  short_title: z.string(),
  tenet_evaluations: z.array(ModelTenetEvaluationSchema),
  question_period_questions: z.array(QuestionSchema),
  final_judgment: z.enum(["yes", "no", "abstain"]),
  rationale: z.string(),
  steel_man: z.string(),
  is_social_issue: z.enum(["yes", "no"]),
});

/** Raw model output, exactly as Structured Outputs returns it (no titles). */
export type ModelBillAnalysis = z.infer<typeof BillAnalysisSchema>;

/** A tenet evaluation enriched with its canonical title (server-side join). */
export interface TenetEvaluation {
  id: number;
  title: string;
  alignment: "aligns" | "conflicts" | "neutral";
  explanation: string;
}

/** The analysis callers consume — model output plus the joined tenet titles. */
export type BillAnalysis = Omit<
  z.infer<typeof BillAnalysisSchema>,
  "tenet_evaluations"
> & {
  tenet_evaluations: TenetEvaluation[];
};
