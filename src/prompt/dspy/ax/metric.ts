/**
 * Ax metric for gated vote accuracy.
 * - Returns 1 if correct, 0 otherwise.
 * - Hard gate: if expectedSocial === "yes", only accept "neutral" predictions as correct.
 */

export type ExpectedFinal = "yes" | "no" | "neutral";
export type ExpectedSocial = "yes" | "no";

export type VotePrediction = {
  finalJudgment?: string;
  isSocialIssue?: string;
  // Allow additional fields without type errors
  [key: string]: unknown;
};

export type VoteExample = {
  input: { billText: string };
  label: {
    expectedFinal: ExpectedFinal;
    expectedSocial: ExpectedSocial;
    rationale?: string;
  };
};

export function voteAccuracy({
  prediction,
  example,
}: {
  prediction: VotePrediction;
  example: VoteExample;
}): number {
  const p = String(prediction?.finalJudgment ?? "")
    .trim()
    .toLowerCase();
  const gold: ExpectedFinal = example.label.expectedFinal;
  const social: ExpectedSocial = example.label.expectedSocial;

  // Enforce business rule: social issues must be neutral
  if (social === "yes") {
    return p === "neutral" ? 1 : 0;
  }

  // Standard accuracy for non-social issues
  return p === gold ? 1 : 0;
}

export default voteAccuracy;
