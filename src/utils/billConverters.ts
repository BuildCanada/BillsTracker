import type { BillDocument } from "@/models/Bill";
import type { ApiBillDetail } from "@/services/billApi";
import {
  summarizeBillText,
  fetchBillMarkdown,
  onBillNotInDatabase,
  type BillAnalysis,
} from "@/services/billApi";
import { socialIssueGrader } from "@/services/social-issue-grader";

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
  final_judgment?: "yes" | "no" | "neutral";
  rationale?: string;
  needs_more_info?: boolean;
  missing_details?: string[];
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
    stages: bill.stages ? [...bill.stages] : [],
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
    final_judgment: bill.final_judgment as "yes" | "no" | "neutral" | undefined,
    rationale: bill.rationale,
    needs_more_info: bill.needs_more_info,
    missing_details: bill.missing_details
      ? [...bill.missing_details]
      : undefined,
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
  if (bill.source) {
    billMarkdown = await fetchBillMarkdown(bill.source);
  }

  // Check if we need to regenerate summary based on source changes from Civics Project API
  const currentSource = bill.source || null;
  let analysis: BillAnalysis = {
    summary: bill.header || "",
    tenet_evaluations: [
      {
        id: 1,
        title: "Canada should aim to be the world's most prosperous country",
        alignment: "neutral",
        explanation: "Not analyzed",
      },
      {
        id: 2,
        title:
          "Promote economic freedom, ambition, and breaking from bureaucratic inertia",
        alignment: "neutral",
        explanation: "Not analyzed",
      },
      {
        id: 3,
        title: "Drive national productivity and global competitiveness",
        alignment: "neutral",
        explanation: "Not analyzed",
      },
      {
        id: 4,
        title: "Grow exports of Canadian products and resources",
        alignment: "neutral",
        explanation: "Not analyzed",
      },
      {
        id: 5,
        title: "Encourage investment, innovation, and resource development",
        alignment: "neutral",
        explanation: "Not analyzed",
      },
      {
        id: 6,
        title:
          "Deliver better public services at lower cost (government efficiency)",
        alignment: "neutral",
        explanation: "Not analyzed",
      },
      {
        id: 7,
        title: "Reform taxes to incentivize work, risk-taking, and innovation",
        alignment: "neutral",
        explanation: "Not analyzed",
      },
      {
        id: 8,
        title: "Focus on large-scale prosperity, not incrementalism",
        alignment: "neutral",
        explanation: "Not analyzed",
      },
    ],
    final_judgment: "no",
    rationale: "Not analyzed",
    needs_more_info: false,
    missing_details: [],
    steel_man: "Not analyzed",
  };
  let shouldRegenerateSummary = true;

  // Check existing bill in database to see if source changed
  try {
    const { connectToDatabase } = await import("@/lib/mongoose");
    const { Bill } = await import("@/models/Bill");

    if (hasValidMongoUri) {
      await connectToDatabase();
      existingBill = (await Bill.findOne({ billId: bill.billID })
        .lean()
        .exec()) as BillDocument | null;

      if (existingBill && existingBill.source === currentSource) {
        // Source hasn't changed, use existing analysis
        analysis = {
          summary: existingBill.summary,
          tenet_evaluations:
            existingBill.tenet_evaluations || analysis.tenet_evaluations,
          final_judgment:
            (existingBill.final_judgment as "yes" | "no" | "neutral") ||
            analysis.final_judgment,
          rationale: existingBill.rationale || analysis.rationale,
          needs_more_info:
            existingBill.needs_more_info || analysis.needs_more_info,
          missing_details:
            existingBill.missing_details || analysis.missing_details,
          steel_man: existingBill.steel_man || analysis.steel_man,
        };
        shouldRegenerateSummary = false;
        console.log(
          `Using existing analysis for ${bill.billID} (source unchanged)`,
        );
      }
    }
  } catch (error) {
    console.error("Error checking existing bill:", error);
    // Continue with regeneration if DB check fails
  }

  if (shouldRegenerateSummary && billMarkdown) {
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
