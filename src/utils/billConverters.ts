import type { BillDocument } from "@/models/Bill";
import type { ApiBillDetail } from "@/services/billApi";
import {
  summarizeBillText,
  fetchBillMarkdown,
  onBillNotInDatabase,
  type BillAnalysis,
} from "@/services/billApi";
import { socialIssueGrader } from "@/services/social-issue-grader";
import { analyzeRelevance } from "@/services/relevance-analyzer";
import { calculateRelevanceLevel } from "@/utils/relevance-level";

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
  needs_more_info?: boolean;
  missing_details?: string[];
  steel_man?: string;
  // Relevance analysis fields
  relevance_score?: number;
  relevance_level?: "low" | "medium" | "high";
  gdp_impact_percent?: number;
  gdp_impact_confidence?: string;
  gdp_impact_justification?: string;
  relevance_justification?: string;
  primary_mechanism?: string;
  implementation_timeline?: string;
  relevance_analysis_timestamp?: Date;
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
    needs_more_info: bill.needs_more_info,
    missing_details: bill.missing_details
      ? [...bill.missing_details]
      : undefined,
    steel_man: bill.steel_man,
    // Relevance analysis fields
    relevance_score: bill.relevance_score,
    relevance_level:
      bill.relevance_level ?? calculateRelevanceLevel(bill.relevance_score),
    gdp_impact_percent: bill.gdp_impact_percent,
    gdp_impact_confidence: bill.gdp_impact_confidence,
    gdp_impact_justification: bill.gdp_impact_justification,
    relevance_justification: bill.relevance_justification,
    primary_mechanism: bill.primary_mechanism,
    implementation_timeline: bill.implementation_timeline,
    relevance_analysis_timestamp: bill.relevance_analysis_timestamp,
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

  // Check if we need to regenerate summary based on source changes from Civics Project API
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
    rationale: undefined,
    needs_more_info: false,
    missing_details: [],
    steel_man: "Not analyzed",
  };

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
          final_judgment: (() => {
            const raw = String(existingBill.final_judgment || "")
              .trim()
              .toLowerCase();
            if (raw === "yes" || raw === "no") return raw as "yes" | "no";
            // Treat legacy "neutral" and any unknown value as "abstain"
            if (raw === "abstain" || raw === "neutral") return "abstain";
            return analysis.final_judgment;
          })(),
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

  // Analyze relevance if missing (new bill or relevance data absent)
  let relevanceAnalysis = null;
  if (
    hasValidMongoUri &&
    billMarkdown &&
    (existingBill === null || typeof existingBill.relevance_score !== "number")
  ) {
    console.log(`🔍 Analyzing relevance for ${bill.billID}...`);
    relevanceAnalysis = await analyzeRelevance(billMarkdown);
    if (relevanceAnalysis) {
      console.log(
        `✅ Relevance analysis complete for ${bill.billID}: score=${relevanceAnalysis.relevance_score}/10, gdp_impact=${relevanceAnalysis.gdp_impact_percent}%`,
      );
    } else {
      console.log(`❌ Relevance analysis failed for ${bill.billID}`);
    }
  } else if (!billMarkdown) {
    console.log(
      `⚠️  Skipping relevance analysis for ${bill.billID}: no markdown available`,
    );
  } else if (existingBill && typeof existingBill.relevance_score === "number") {
    console.log(
      `ℹ️  Skipping relevance analysis for ${bill.billID}: already has relevance_score=${existingBill.relevance_score}`,
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
    relevanceAnalysis: relevanceAnalysis,
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
    // Include relevance analysis data if available
    relevance_score:
      existingBill?.relevance_score ?? relevanceAnalysis?.relevance_score,
    relevance_level:
      existingBill?.relevance_level ??
      calculateRelevanceLevel(
        existingBill?.relevance_score ?? relevanceAnalysis?.relevance_score,
      ),
    gdp_impact_percent:
      existingBill?.gdp_impact_percent ?? relevanceAnalysis?.gdp_impact_percent,
    gdp_impact_confidence:
      existingBill?.gdp_impact_confidence ??
      relevanceAnalysis?.gdp_impact_confidence,
    gdp_impact_justification:
      existingBill?.gdp_impact_justification ??
      relevanceAnalysis?.gdp_impact_justification,
    relevance_justification:
      existingBill?.relevance_justification ??
      relevanceAnalysis?.relevance_justification,
    primary_mechanism:
      existingBill?.primary_mechanism ?? relevanceAnalysis?.primary_mechanism,
    implementation_timeline:
      existingBill?.implementation_timeline ??
      relevanceAnalysis?.implementation_timeline,
    relevance_analysis_timestamp:
      existingBill?.relevance_analysis_timestamp ??
      (relevanceAnalysis ? new Date() : undefined),
  };
}
