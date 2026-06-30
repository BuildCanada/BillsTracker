export type FinalJudgment = "yes" | "no" | "abstain";

/**
 * Normalize an arbitrary stored/incoming `final_judgment` value into one of the
 * three supported judgments.
 *
 * - "yes" / "no" (any casing or surrounding whitespace) pass through.
 * - "abstain" and legacy "neutral" map to "abstain".
 * - Anything else (empty, unknown, null/undefined) falls back to `fallback`.
 */
export function normalizeFinalJudgment(
  value: unknown,
  fallback: FinalJudgment = "abstain",
): FinalJudgment {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  if (raw === "yes" || raw === "no") return raw;
  if (raw === "abstain" || raw === "neutral") return "abstain";
  return fallback;
}
