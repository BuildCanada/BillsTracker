/**
 * Centralized Build Canada tenets and helper utilities
 * - Single source of truth for TENETS
 * - Derived TENETS_LIST for deterministic iteration
 * - Shared TenetEvaluation type
 * - Helper to get a tenet title by id
 * - Helper to build neutral skeleton evaluations
 */

export const TENETS = Object.freeze({
  1: "Canada should aim to be the world's most prosperous country.",
  2: "Promote economic freedom, ambition, and breaking from bureaucratic inertia.",
  3: "Drive national productivity and global competitiveness.",
  4: "Grow exports of Canadian products and resources.",
  5: "Encourage investment, innovation, and resource development.",
  6: "Deliver better public services at lower cost (government efficiency).",
  7: "Reform taxes to incentivize work, risk-taking, and innovation.",
  8: "Focus on large-scale prosperity, not incrementalism.",
  9: "Protect freedom of expression and due process; favour content-neutral rules.",
  10: "Strengthen rule of law, predictable regulation, and property rights.",
  11: "Prefer competition and market dynamism over administrative control.",
  12: "Attract and retain global talent and capital; cut brain drain.",
  13: "Ensure fiscal sustainability; avoid unfunded mandates and hidden taxes.",
}) as Readonly<Record<number, string>>;

/**
 * Sorted list of tenets derived from TENETS for stable iteration.
 */
export const TENETS_LIST = Object.freeze(
  Object.entries(TENETS)
    .map(([id, title]) => Object.freeze({ id: Number(id), title }))
    .sort((a, b) => a.id - b.id),
) as ReadonlyArray<Readonly<{ id: number; title: string }>>;

/**
 * Shared type definition for a tenet evaluation.
 */
export type TenetEvaluation = {
  id: number;
  title: string;
  alignment: "aligns" | "conflicts" | "neutral";
  explanation: string;
};

/**
 * Get the tenet title by numeric id.
 * Returns undefined if the id does not exist in TENETS.
 */
export function getTenetTitle(id: number): string | undefined {
  return (TENETS as Record<number, string | undefined>)[id];
}

/**
 * Build a neutral skeleton of tenet evaluations for all defined TENETS.
 * - alignment defaults to "neutral"
 * - explanation defaults to an empty string, but can be overridden per use-case
 */
export function buildTenetEvaluations(options?: {
  alignment?: "aligns" | "conflicts" | "neutral";
  explanation?: string;
}): TenetEvaluation[] {
  const alignment = options?.alignment ?? "neutral";
  const explanation = options?.explanation ?? "";

  return TENETS_LIST.map(({ id, title }) => ({
    id,
    title,
    alignment,
    explanation,
  }));
}
