import { z } from "zod";

/**
 * Single source of truth for the shape of an AI bill analysis.
 *
 * This Zod schema is passed to OpenAI Structured Outputs (via `zodTextFormat`)
 * so the model is *forced* to return JSON matching it exactly — no hand-parsing
 * or regex fallback. The `BillAnalysis` type is derived from it so the schema
 * and the TS type can never drift apart.
 *
 * Note: every field is required (no `.optional()`) because OpenAI strict
 * structured outputs require all keys to be present.
 */
export const TenetEvaluationSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  alignment: z.enum(["aligns", "conflicts", "neutral"]),
  explanation: z.string(),
});

export const QuestionSchema = z.object({
  question: z.string(),
});

export const BillAnalysisSchema = z.object({
  summary: z.string(),
  short_title: z.string(),
  tenet_evaluations: z.array(TenetEvaluationSchema),
  question_period_questions: z.array(QuestionSchema),
  final_judgment: z.enum(["yes", "no", "abstain"]),
  rationale: z.string(),
  steel_man: z.string(),
  is_social_issue: z.enum(["yes", "no"]),
});

export type BillAnalysis = z.infer<typeof BillAnalysisSchema>;
export type TenetEvaluation = z.infer<typeof TenetEvaluationSchema>;
