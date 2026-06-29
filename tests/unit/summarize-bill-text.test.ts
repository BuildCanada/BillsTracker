import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the shared OpenAI client so no network call happens.
const parse = vi.fn();
vi.mock("@/lib/openai", () => ({
  getOpenAI: () => ({ responses: { parse } }),
  hasOpenAIKey: vi.fn(),
}));

import { summarizeBillText, BillAnalysisError } from "@/services/billApi";
import { hasOpenAIKey } from "@/lib/openai";

const mockHasKey = vi.mocked(hasOpenAIKey);

const validAnalysis = {
  summary: "Does X.",
  short_title: "X",
  tenet_evaluations: [],
  question_period_questions: [],
  final_judgment: "yes" as const,
  rationale: "ok",
  steel_man: "case",
  is_social_issue: "no" as const,
};

describe("summarizeBillText (fail-loud)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws BillAnalysisError when no API key is configured", async () => {
    mockHasKey.mockReturnValue(false);
    await expect(summarizeBillText("bill text")).rejects.toBeInstanceOf(
      BillAnalysisError,
    );
    expect(parse).not.toHaveBeenCalled();
  });

  it("throws BillAnalysisError when the OpenAI request fails", async () => {
    mockHasKey.mockReturnValue(true);
    parse.mockRejectedValue(new Error("503 service unavailable"));
    await expect(summarizeBillText("bill text")).rejects.toBeInstanceOf(
      BillAnalysisError,
    );
  });

  it("throws BillAnalysisError when the model returns no parsed output", async () => {
    mockHasKey.mockReturnValue(true);
    parse.mockResolvedValue({ output_parsed: null } as never);
    await expect(summarizeBillText("bill text")).rejects.toBeInstanceOf(
      BillAnalysisError,
    );
  });

  it("returns the parsed analysis on success", async () => {
    mockHasKey.mockReturnValue(true);
    parse.mockResolvedValue({ output_parsed: validAnalysis } as never);
    await expect(summarizeBillText("bill text")).resolves.toEqual(
      validAnalysis,
    );
  });
});
