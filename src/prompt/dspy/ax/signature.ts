import { ax } from "@ax-llm/ax";

/**
 * Ax program signature for the bill analysis task.
 * Input: billText (markdown or plain)
 * Outputs:
 *  - summary: 3–5 sentences + bullets (markdown)
 *  - shortTitle: 1–2 words
 *  - tenetEvaluations: Array of { id, title, alignment, explanation } for all defined tenets
 *  - finalJudgment: class "yes, no, neutral"
 *  - rationale: two sentences + bullets
 *  - isSocialIssue: class "yes, no"
 *  - questionPeriodQuestions: Array[3] of { question }
 */
export const summarizeAndVote = ax(`
  billText:string "Full bill text (markdown or plain)"
    ->
  summary:string "3-5 sentences + bullets (markdown)",
  shortTitle:string "1-2 words",
  tenetEvaluations:json "Array of {id,title,alignment,explanation} for all tenets",
  finalJudgment:class "yes, no, neutral" "Overall vote",
  rationale:string "Two sentences + bullets",
  isSocialIssue:class "yes, no" "Primary social issue?",
  questionPeriodQuestions:json "Array[3] of {question}"
`);

export default summarizeAndVote;
