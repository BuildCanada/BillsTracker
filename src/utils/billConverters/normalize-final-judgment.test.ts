import { describe, expect, it } from "vitest";
import { normalizeFinalJudgment } from "./normalize-final-judgment";

describe("normalizeFinalJudgment", () => {
  it("passes through 'yes' and 'no'", () => {
    expect(normalizeFinalJudgment("yes")).toBe("yes");
    expect(normalizeFinalJudgment("no")).toBe("no");
  });

  it("lowercases and trims yes/no", () => {
    expect(normalizeFinalJudgment("  YES ")).toBe("yes");
    expect(normalizeFinalJudgment("No")).toBe("no");
  });

  it("maps 'abstain' and legacy 'neutral' to 'abstain'", () => {
    expect(normalizeFinalJudgment("abstain")).toBe("abstain");
    expect(normalizeFinalJudgment("NEUTRAL")).toBe("abstain");
  });

  it("falls back to 'abstain' by default for unknown/empty values", () => {
    expect(normalizeFinalJudgment("")).toBe("abstain");
    expect(normalizeFinalJudgment("maybe")).toBe("abstain");
    expect(normalizeFinalJudgment(null)).toBe("abstain");
    expect(normalizeFinalJudgment(undefined)).toBe("abstain");
  });

  it("uses the provided fallback only for unknown values", () => {
    expect(normalizeFinalJudgment("maybe", "no")).toBe("no");
    expect(normalizeFinalJudgment("", "yes")).toBe("yes");
    // abstain/neutral always normalize to abstain, ignoring the fallback
    expect(normalizeFinalJudgment("neutral", "no")).toBe("abstain");
    // a valid value still wins over the fallback
    expect(normalizeFinalJudgment("yes", "no")).toBe("yes");
  });
});
