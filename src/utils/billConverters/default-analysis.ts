import type { BillAnalysis } from "@/services/billApi";

// The Build Canada tenets used as the baseline ("Not analyzed") evaluation set
// when a bill has not yet been run through the AI analysis.
export const DEFAULT_TENET_EVALUATIONS: BillAnalysis["tenet_evaluations"] = [
  {
    id: 1,
    title: "Canada should aim to be the world's most prosperous country",
    alignment: "neutral",
    explanation: "Not analyzed",
  },
  {
    id: 2,
    title:
      "Promote economic freedom, ambition, and breaking from bureaucratic inertia",
    alignment: "neutral",
    explanation: "Not analyzed",
  },
  {
    id: 3,
    title: "Drive national productivity and global competitiveness",
    alignment: "neutral",
    explanation: "Not analyzed",
  },
  {
    id: 4,
    title: "Grow exports of Canadian products and resources",
    alignment: "neutral",
    explanation: "Not analyzed",
  },
  {
    id: 5,
    title: "Encourage investment, innovation, and resource development",
    alignment: "neutral",
    explanation: "Not analyzed",
  },
  {
    id: 6,
    title:
      "Deliver better public services at lower cost (government efficiency)",
    alignment: "neutral",
    explanation: "Not analyzed",
  },
  {
    id: 7,
    title: "Reform taxes to incentivize work, risk-taking, and innovation",
    alignment: "neutral",
    explanation: "Not analyzed",
  },
  {
    id: 8,
    title: "Focus on large-scale prosperity, not incrementalism",
    alignment: "neutral",
    explanation: "Not analyzed",
  },
];

/**
 * Build the default analysis used before a bill has been analyzed by the AI.
 */
export function createDefaultAnalysis(summary: string): BillAnalysis {
  return {
    summary,
    tenet_evaluations: DEFAULT_TENET_EVALUATIONS.map((te) => ({ ...te })),
    final_judgment: "no",
    rationale: undefined,
    needs_more_info: false,
    missing_details: [],
    steel_man: "Not analyzed",
  };
}
