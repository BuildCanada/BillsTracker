import { promises as fs } from "node:fs";
import { summarizeAndVote } from "./signature";

/**
 * Ensures the saved optimization is applied at most once per process.
 */
let optimizationApplied = false;

/**
 * Load and apply the saved Ax optimization for summarizeAndVote, if present.
 * - Reads from optimizations/summary-vote.v1.json
 * - Applies demos to the signature
 * - Returns true if applied, false otherwise (e.g., file missing)
 */
export async function loadOptimizationIfAny(): Promise<boolean> {
  if (optimizationApplied) return true;
  try {
    const path = "optimizations/summary-vote.v1.json";
    const raw = await fs.readFile(path, "utf8");
    const parsed = JSON.parse(raw);

    // Apply the demos from the optimization
    if (parsed.demos && Array.isArray(parsed.demos)) {
      summarizeAndVote.setDemos(parsed.demos);
      optimizationApplied = true;
      return true;
    }
    return false;
  } catch {
    // No saved optimization available or failed to apply.
    return false;
  }
}

export default loadOptimizationIfAny;
