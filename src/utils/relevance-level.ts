/**
 * Utility functions for relevance level calculation
 */

export type RelevanceLevel = "low" | "medium" | "high";

/**
 * Calculate relevance level from relevance score
 * - low: 1-3
 * - medium: 4-7
 * - high: 8-10
 */
export function calculateRelevanceLevel(
  relevanceScore: number | undefined | null,
): RelevanceLevel | undefined {
  if (typeof relevanceScore !== "number") {
    return undefined;
  }

  if (relevanceScore >= 8) {
    return "high";
  } else if (relevanceScore >= 4) {
    return "medium";
  } else if (relevanceScore >= 1) {
    return "low";
  }

  // For scores < 1, return undefined (invalid score)
  return undefined;
}
