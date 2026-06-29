import type { BillDocument } from "@/models/Bill";
import type { ApiBillDetail } from "@/services/billApi";
import {
  summarizeBillText,
  fetchBillMarkdown,
  onBillNotInDatabase,
  type BillAnalysis,
} from "@/services/billApi";

// Unified bill data structure
export interface UnifiedBill {
  billId: string;
  title: string;
  short_title?: string;
  summary: string;
  status: string;
  sponsorParty?: string;
  chamber?: string;
  supportedRegion?: string;
  introducedOn?: Date;
  lastUpdatedOn?: Date;
  stages: {
    stage: string;
    state: string;
    house: string;
    date: Date;
  }[];
  genres?: string[];
  parliamentNumber?: number;
  sessionNumber?: number;
  votes?: Array<{ motion?: string; result: string }>;
  fullTextMarkdown?: string | null;
  isSocialIssue?: boolean;
  question_period_questions?: Array<{ question: string }>;
  // Analysis data from AI
  tenet_evaluations?: Array<{
    id: number;
    title: string;
    alignment: "aligns" | "conflicts" | "neutral";
    explanation: string;
  }>;
  final_judgment: "yes" | "no" | "abstain";
  rationale?: string;
  steel_man?: string;
}

// Convert Build Canada DB bill to unified format
export function fromBuildCanadaDbBill(bill: BillDocument): UnifiedBill {
  return {
    billId: bill.billId,
    title: bill.title,
    short_title: bill.short_title,
    summary: bill.summary,
    status: bill.status,
    sponsorParty: bill.sponsorParty,
    chamber: bill.chamber,
    supportedRegion: bill.supportedRegion,
    introducedOn: bill.introducedOn,
    lastUpdatedOn: bill.lastUpdatedOn,
    stages: bill.stages
      ? bill.stages.map((stage) => ({
          stage: stage.stage,
          state: stage.state,
          house: stage.house,
          date: stage.date,
        }))
      : [],
    genres: bill.genres ? [...bill.genres] : undefined,
    parliamentNumber: bill.parliamentNumber,
    sessionNumber: bill.sessionNumber,
    votes: bill.votes?.map((v) => ({
      motion: v.motion,
      result: v.result,
    })),
    isSocialIssue: bill.isSocialIssue,
    // Properly serialize question_period_questions to remove MongoDB ObjectIds
    question_period_questions: bill.question_period_questions?.map((q) => ({
      question: q.question,
    })),
    // Include analysis data - ensure proper serialization
    tenet_evaluations: bill.tenet_evaluations?.map((te) => ({
      id: te.id,
      title: te.title,
      alignment: te.alignment,
      explanation: te.explanation,
    })),
    final_judgment:
      (bill.final_judgment ?? "").toString().trim().toLowerCase() === "yes" ||
      (bill.final_judgment ?? "").toString().trim().toLowerCase() === "no"
        ? (bill.final_judgment as "yes" | "no")
        : "abstain",
    rationale: bill.rationale,
    steel_man: bill.steel_man,
  };
}

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

  // The AI analysis. Stays null until we either reuse a stored analysis or
  // successfully generate a new one. If generation fails we leave it null and
  // skip persisting, so a transient AI outage never writes a fake verdict.
  let analysis: BillAnalysis | null = null;
  let isSocialIssue = false;

  // Check existing bill in database; reuse its analysis when present.
  try {
    const { connectToDatabase } = await import("@/lib/mongoose");
    const { Bill } = await import("@/models/Bill");

    if (hasValidMongoUri) {
      await connectToDatabase();
      existingBill = (await Bill.findOne({ billId: bill.billID })
        .lean()
        .exec()) as BillDocument | null;

      if (existingBill) {
        const raw = String(existingBill.final_judgment || "")
          .trim()
          .toLowerCase();
        const final_judgment: "yes" | "no" | "abstain" =
          raw === "yes" || raw === "no" ? (raw as "yes" | "no") : "abstain";
        isSocialIssue =
          typeof existingBill.isSocialIssue === "boolean"
            ? existingBill.isSocialIssue
            : false;
        analysis = {
          summary: existingBill.summary,
          short_title: existingBill.short_title || "",
          tenet_evaluations: existingBill.tenet_evaluations || [],
          question_period_questions:
            existingBill.question_period_questions || [],
          final_judgment,
          rationale: existingBill.rationale || "",
          steel_man: existingBill.steel_man || "",
          is_social_issue: isSocialIssue ? "yes" : "no",
        };
        console.log(`Using existing analysis for ${bill.billID}`);
      }
    }
  } catch (error) {
    console.error("Error checking existing bill:", error);
    // Continue; we may still generate fresh analysis below.
  }

  // Generate fresh analysis only when there's no stored analysis and we have
  // bill text. Failures are swallowed here (logged) so the page still renders
  // the raw bill — but nothing is persisted.
  if (!analysis && billMarkdown) {
    console.log(`Generating analysis for ${bill.billID}`);
    try {
      analysis = await summarizeBillText(billMarkdown);
      isSocialIssue = analysis.is_social_issue === "yes";
    } catch (error) {
      console.error(`Failed to analyze ${bill.billID}; skipping save:`, error);
    }
  }

  // Persist only when we have a real analysis.
  if (analysis) {
    await onBillNotInDatabase({
      billId: bill.billID,
      source: bill.source,
      markdown: billMarkdown,
      bill,
      analysis,
      billTextsCount: Array.isArray(bill.billTexts) ? bill.billTexts.length : 0,
      isSocialIssue,
    });
  }

  return {
    billId: bill.billID,
    title: bill.title,
    short_title: bill.shortTitle,
    summary: analysis?.summary ?? bill.header ?? "",
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
    isSocialIssue,
    question_period_questions: analysis?.question_period_questions,
    // Include analysis data when available.
    tenet_evaluations: analysis?.tenet_evaluations,
    // No real verdict yet → "abstain" so the UI hides the determination.
    final_judgment: analysis?.final_judgment ?? "abstain",
    rationale: analysis?.rationale,
    steel_man: analysis?.steel_man,
  };
}
