import { describe, it, expect } from "vitest";
import { BillAnalysisSchema } from "@/prompt/schema";

const validAnalysis = {
  summary: "This bill does X.",
  short_title: "Soil Act",
  tenet_evaluations: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `Tenet ${i + 1}`,
    alignment: "neutral" as const,
    explanation: "n/a",
  })),
  question_period_questions: [{ question: "Why?" }],
  final_judgment: "yes" as const,
  rationale: "Because.",
  steel_man: "The strongest case for it.",
  is_social_issue: "no" as const,
};

describe("BillAnalysisSchema", () => {
  it("accepts a well-formed analysis", () => {
    expect(BillAnalysisSchema.safeParse(validAnalysis).success).toBe(true);
  });

  it("rejects an invalid final_judgment enum", () => {
    const bad = { ...validAnalysis, final_judgment: "maybe" };
    expect(BillAnalysisSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an invalid tenet alignment enum", () => {
    const bad = {
      ...validAnalysis,
      tenet_evaluations: [
        { id: 1, title: "T", alignment: "supports", explanation: "x" },
      ],
    };
    expect(BillAnalysisSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const { steel_man, ...bad } = validAnalysis;
    void steel_man;
    expect(BillAnalysisSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an invalid is_social_issue enum", () => {
    const bad = { ...validAnalysis, is_social_issue: "true" };
    expect(BillAnalysisSchema.safeParse(bad).success).toBe(false);
  });
});
