import { describe, it, expect } from "vitest";
import {
  findGuardrailViolations,
  checkAnalysisGuardrails,
} from "@/utils/analysis-guardrails/analysis-guardrails.util";

describe("findGuardrailViolations", () => {
  const cases: Array<[string, number]> = [
    ["This bill improves agricultural productivity.", 0],
    ["Build Canada supports this bill.", 1], // build canada
    ["We believe this is positive.", 1], // we
    ["This conflicts with our goals.", 1], // our
    ["It undermines the tenets of prosperity.", 1], // tenets
    ["We at Build Canada reviewed the tenets.", 3], // we + build canada + tenets
  ];

  it.each(cases)("flags %j with %i violations", (text, expected) => {
    expect(findGuardrailViolations(text)).toHaveLength(expected);
  });

  it("returns nothing for empty input", () => {
    expect(findGuardrailViolations("")).toEqual([]);
    expect(findGuardrailViolations(undefined)).toEqual([]);
  });

  it("does not flag substrings inside words (e.g. 'website', 'powerful')", () => {
    expect(findGuardrailViolations("The website is powerful.")).toEqual([]);
  });
});

describe("checkAnalysisGuardrails", () => {
  it("reports violations per field", () => {
    const violations = checkAnalysisGuardrails({
      summary: "Build Canada likes this.",
      rationale: "We approve.",
      steel_man: "A strong, clean case.",
      questions: [{ question: "Why do our farmers suffer?" }],
    });
    expect(violations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("summary:"),
        expect.stringContaining("rationale:"),
        expect.stringContaining("question[0]:"),
      ]),
    );
    // steel_man is clean.
    expect(violations.some((v) => v.startsWith("steel_man:"))).toBe(false);
  });

  it("returns empty for a clean analysis", () => {
    expect(
      checkAnalysisGuardrails({
        summary: "Reduces costs for producers.",
        rationale: "Improves competitiveness.",
        steel_man: "Strongest case in favour.",
        questions: [{ question: "What is the fiscal impact?" }],
      }),
    ).toEqual([]);
  });
});
