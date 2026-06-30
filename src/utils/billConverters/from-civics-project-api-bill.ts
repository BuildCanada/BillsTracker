import type { BillDocument } from "@/models/Bill";
import type { ApiBillDetail } from "@/services/billApi";
import {
  type BillAnalysis,
  fetchBillMarkdown,
  onBillNotInDatabase,
  summarizeBillText,
} from "@/services/billApi";
import { socialIssueGrader } from "@/services/social-issue-grader";
import { createDefaultAnalysis } from "./default-analysis";
import { normalizeFinalJudgment } from "./normalize-final-judgment";
import type { UnifiedBill } from "./types";

// Convert Civics Project API bill to unified format
export async function fromCivicsProjectApiBill(
  bill: ApiBillDetail,
): Promise<UnifiedBill> {
  const { env } = await import("@/env");
  const uri = env.MONGO_URI || "";
  const hasValidMongoUri =
    uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
  let existingBill: BillDocument | null = null;
  const latestStageDate =
    bill.stages && bill.stages.length > 0
      ? bill.stages[bill.stages.length - 1].date
      : (bill.updatedAt ?? bill.date);
  const house =
    bill.stages && bill.stages.length > 0
      ? bill.stages[bill.stages.length - 1].house
      : undefined;

  let billMarkdown: string | null = null;

  const latestBillSource =
    bill.source || (bill.billTexts?.[0] as { url?: string })?.url;

  if (latestBillSource) {
    billMarkdown = await fetchBillMarkdown(latestBillSource);
  }

  // Check if we need to regenerate summary based on source changes from Civics Project API
  let analysis: BillAnalysis = createDefaultAnalysis(bill.header || "");

  // Check existing bill in database to see if source changed
  try {
    const { connectToDatabase } = await import("@/lib/mongoose");
    const { Bill } = await import("@/models/Bill");

    if (hasValidMongoUri) {
      await connectToDatabase();
      existingBill = (await Bill.findOne({ billId: bill.billID })
        .lean()
        .exec()) as BillDocument | null;

      if (existingBill && !analysis.rationale) {
        // Source hasn't changed, use existing analysis
        analysis = {
          summary: existingBill.summary,
          tenet_evaluations:
            existingBill.tenet_evaluations || analysis.tenet_evaluations,
          // Treat legacy "neutral" and any unknown value as "abstain",
          // falling back to the default analysis judgment when empty.
          final_judgment: normalizeFinalJudgment(
            existingBill.final_judgment,
            analysis.final_judgment,
          ),
          rationale: existingBill.rationale || analysis.rationale,
          needs_more_info:
            existingBill.needs_more_info || analysis.needs_more_info,
          missing_details:
            existingBill.missing_details || analysis.missing_details,
          steel_man: existingBill.steel_man || analysis.steel_man,
        };
        console.log(
          `Using existing analysis for ${bill.billID} (source unchanged)`,
        );
      }
    }
  } catch (error) {
    console.error("Error checking existing bill:", error);
    // Continue with regeneration if DB check fails
  }

  if (!analysis?.rationale && billMarkdown) {
    console.log(`Regenerating analysis for ${bill.billID} (source changed)`);
    analysis = await summarizeBillText(billMarkdown);
  }

  // Only classify if missing (new bill or classification absent). Avoid calling otherwise.
  let isSocialIssueFinal: boolean =
    typeof existingBill?.isSocialIssue === "boolean"
      ? ((existingBill as BillDocument).isSocialIssue as boolean)
      : false;
  if (
    hasValidMongoUri &&
    (existingBill === null || typeof existingBill.isSocialIssue !== "boolean")
  ) {
    isSocialIssueFinal = await socialIssueGrader(
      billMarkdown || analysis.summary || bill.header || bill.title,
    );
  }

  await onBillNotInDatabase({
    billId: bill.billID,
    source: bill.source,
    markdown: billMarkdown,
    bill,
    analysis,
    billTextsCount: Array.isArray(bill.billTexts) ? bill.billTexts.length : 0,
    isSocialIssue: isSocialIssueFinal,
  });

  return {
    billId: bill.billID,
    title: bill.title,
    short_title: bill.shortTitle,
    summary: analysis.summary,
    status: bill.status,
    stages: bill.stages
      ? bill.stages.map((stage) => ({
          stage: stage.stage,
          state: stage.state,
          house: stage.house,
          date: new Date(stage.date),
        }))
      : [],
    sponsorParty: bill.sponsorParty,
    chamber: house,
    supportedRegion: bill.supportedRegion,
    introducedOn: new Date(bill.date),
    lastUpdatedOn: new Date(latestStageDate),
    genres: bill.genres,
    parliamentNumber: bill.parliamentNumber,
    sessionNumber: bill.sessionNumber,
    fullTextMarkdown: billMarkdown,
    question_period_questions: analysis.question_period_questions,
    // Include analysis data
    tenet_evaluations: analysis.tenet_evaluations,
    final_judgment: analysis.final_judgment,
    rationale: analysis.rationale,
    needs_more_info: analysis.needs_more_info,
    missing_details: analysis.missing_details,
    steel_man: analysis.steel_man,
  };
}
