type Alignment = "aligns" | "conflicts" | "neutral" | null | undefined;

interface TenetEvaluation {
  alignment?: Alignment;
}

/**
 * Checks whether the vote should be forced to "neutral"
 * when there is only a single non-neutral evaluation
 * (either one "aligns" or one "conflicts") and all others are neutral.
 */
export function isSingleTenet(evaluations: TenetEvaluation[]): boolean {
  if (!evaluations || evaluations.length === 0) return false;

  const counts = evaluations.reduce(
    (acc, t) => {
      switch (t?.alignment) {
        case "aligns":
          acc.aligns++;
          break;
        case "conflicts":
          acc.conflicts++;
          break;
        default:
          acc.neutral++;
      }
      return acc;
    },
    { aligns: 0, conflicts: 0, neutral: 0 },
  );

  const nonNeutralCount = counts.aligns + counts.conflicts;
  return nonNeutralCount === 1 && counts.neutral === evaluations.length - 1;
}
