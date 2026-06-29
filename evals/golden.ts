/**
 * Golden dataset for bill-analysis evals.
 *
 * Each entry pins human-agreed expectations for a fixture bill. Reuses the XML
 * fixtures already in tests/fixtures/, so adding a bill is just: drop its XML in
 * tests/fixtures/, add an entry here. `expectedJudgment`/`expectedSocialIssue`
 * are best-effort ground truth — adjust them as the team's view settles.
 */
export interface GoldenBill {
  /** Fixture file basename in tests/fixtures (without .xml). */
  fixture: string;
  billId: string;
  /** Expected final judgment, or "any" when reasonable people could differ. */
  expectedJudgment: "yes" | "no" | "abstain" | "any";
  expectedSocialIssue: "yes" | "no";
  /** Lowercased substrings the summary must contain. */
  mustMention: string[];
}

export const GOLDEN_BILLS: GoldenBill[] = [
  {
    fixture: "s-230",
    billId: "S-230",
    // Creates a new national-strategy reporting obligation (adds process).
    expectedJudgment: "any",
    expectedSocialIssue: "no",
    mustMention: ["soil"],
  },
  {
    fixture: "s-231",
    billId: "S-231",
    expectedJudgment: "any",
    expectedSocialIssue: "no",
    mustMention: ["corporation"],
  },
  {
    fixture: "c-208",
    billId: "C-208",
    // Eases intergenerational small-business/farm transfers via the tax code.
    expectedJudgment: "yes",
    expectedSocialIssue: "no",
    mustMention: ["tax"],
  },
  {
    fixture: "c-206",
    billId: "C-206",
    // Carbon-pricing exemption for farmers — reduces a cost on producers.
    expectedJudgment: "any",
    expectedSocialIssue: "no",
    mustMention: ["carbon"],
  },
];
