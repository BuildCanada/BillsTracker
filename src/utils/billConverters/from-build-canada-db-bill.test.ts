import { describe, expect, it } from "vitest";
import type { BillDocument } from "@/models/Bill";
import { fromBuildCanadaDbBill } from "./from-build-canada-db-bill";

function makeBill(overrides: Partial<BillDocument> = {}): BillDocument {
  return {
    billId: "C-18",
    title: "An Act respecting things",
    summary: "A summary",
    status: "In progress",
    chamber: "House of Commons",
    tenet_evaluations: [],
    final_judgment: "yes",
    rationale: "because",
    needs_more_info: false,
    missing_details: [],
    steel_man: "steel man",
    ...overrides,
  } as unknown as BillDocument;
}

describe("fromBuildCanadaDbBill", () => {
  it("maps core fields straight through", () => {
    const result = fromBuildCanadaDbBill(
      makeBill({ billId: "S-5", title: "Title", summary: "Sum" }),
    );
    expect(result.billId).toBe("S-5");
    expect(result.title).toBe("Title");
    expect(result.summary).toBe("Sum");
  });

  it("normalizes the final_judgment", () => {
    expect(
      fromBuildCanadaDbBill(makeBill({ final_judgment: "YES" })).final_judgment,
    ).toBe("yes");
    expect(
      fromBuildCanadaDbBill(makeBill({ final_judgment: "neutral" }))
        .final_judgment,
    ).toBe("abstain");
    expect(
      fromBuildCanadaDbBill(makeBill({ final_judgment: "garbage" }))
        .final_judgment,
    ).toBe("abstain");
  });

  it("defaults stages to an empty array when absent", () => {
    expect(
      fromBuildCanadaDbBill(makeBill({ stages: undefined })).stages,
    ).toEqual([]);
  });

  it("maps stages preserving fields", () => {
    const date = new Date("2024-01-01");
    const result = fromBuildCanadaDbBill(
      makeBill({
        stages: [
          { stage: "First reading", state: "completed", house: "HoC", date },
        ] as unknown as BillDocument["stages"],
      }),
    );
    expect(result.stages).toEqual([
      { stage: "First reading", state: "completed", house: "HoC", date },
    ]);
  });

  it("copies genres and missing_details into fresh arrays", () => {
    const genres = ["tax", "trade"];
    const missing = ["cost"];
    const result = fromBuildCanadaDbBill(
      makeBill({ genres, missing_details: missing }),
    );
    expect(result.genres).toEqual(genres);
    expect(result.genres).not.toBe(genres);
    expect(result.missing_details).toEqual(missing);
    expect(result.missing_details).not.toBe(missing);
  });

  it("strips extra fields from question_period_questions", () => {
    const result = fromBuildCanadaDbBill(
      makeBill({
        question_period_questions: [
          { question: "Q1", _id: "abc" },
        ] as unknown as BillDocument["question_period_questions"],
      }),
    );
    expect(result.question_period_questions).toEqual([{ question: "Q1" }]);
  });

  it("maps votes to motion and result only", () => {
    const result = fromBuildCanadaDbBill(
      makeBill({
        votes: [
          { motion: "M1", result: "passed", yeas: 100 },
        ] as unknown as BillDocument["votes"],
      }),
    );
    expect(result.votes).toEqual([{ motion: "M1", result: "passed" }]);
  });
});
