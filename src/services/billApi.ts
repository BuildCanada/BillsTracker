import { xmlToMarkdown } from "@/utils/xml-to-md/xml-to-md.util";
import { SUMMARY_AND_VOTE_PROMPT } from "@/prompt/summary-and-vote-prompt";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAI, hasOpenAIKey } from "@/lib/openai";
import { type BillAnalysis, BillAnalysisSchema } from "@/prompt/schema";
import {
  BILL_API_REVALIDATE_INTERVAL,
  BILL_ANALYSIS_EFFORT,
  BILL_ANALYSIS_MODEL,
} from "@/consts/general";
import { env } from "@/env";

export type { BillAnalysis } from "@/prompt/schema";

/** Thrown when AI analysis cannot be produced. Callers must NOT persist a
 * fabricated analysis on failure — they should skip the write and/or surface
 * an error so a transient outage never overwrites a real verdict. */
export class BillAnalysisError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "BillAnalysisError";
  }
}

export type ApiStage = {
  stage: string;
  state: string;
  house: string;
  date: string;
};

export type ApiBillDetail = {
  _id?: string;
  internalID?: string;
  billID: string;
  title: string;
  shortTitle?: string;
  header: string;
  summary?: string;
  genres?: string[];
  date: string;
  updatedAt?: string;
  status: string;
  stage?: string;
  stages?: ApiStage[];
  sponsorParty?: string;
  sponsorID?: string[];
  sponsorName?: string[];
  parliamentNumber: number;
  sessionNumber: number;
  supportedRegion?: string;
  interestLevel?: number;
  source?: string;
  votes?: unknown[];
  billTexts?: unknown[];
};

const CANADIAN_PARLIAMENT_NUMBER = 45;

export async function getBillFromCivicsProjectApi(
  billId: string,
): Promise<ApiBillDetail | null> {
  const URL = `${env.CIVICS_PROJECT_BASE_URL}/canada/bills/${CANADIAN_PARLIAMENT_NUMBER}/${billId}`;
  const response = await fetch(URL, {
    // Cache individual bills.
    ...(process.env.NODE_ENV === "production"
      ? { next: { revalidate: BILL_API_REVALIDATE_INTERVAL } }
      : { cache: "no-store" }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIVICS_PROJECT_API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch bill details");
  }
  const json = await response.json();
  const data = (json?.data?.bill ?? json?.data ?? json) as
    | ApiBillDetail
    | ApiBillDetail[]
    | null;
  if (!data) return null;
  if (Array.isArray(data)) {
    return (
      data.find((b) => b.billID?.toLowerCase() === billId.toLowerCase()) ?? null
    );
  }
  return data;
}

/**
 * Run the full Build Canada analysis on a bill's text.
 *
 * Uses OpenAI Structured Outputs so the response is guaranteed to match
 * `BillAnalysisSchema` — there is no JSON.parse/regex fallback. On any failure
 * (missing key, API error after retries, refusal) this THROWS a
 * `BillAnalysisError`. Callers must catch it and avoid persisting a fabricated
 * analysis, so a transient outage never overwrites a real verdict in the DB.
 */
export async function summarizeBillText(input: string): Promise<BillAnalysis> {
  if (!hasOpenAIKey()) {
    throw new BillAnalysisError(
      "OPENAI_API_KEY is not set; cannot analyze bill text",
    );
  }

  console.log("Analyzing bill text with AI");
  const prompt = `${SUMMARY_AND_VOTE_PROMPT}\n\nBill Text:\n${input}`;

  let parsed: BillAnalysis | null;
  try {
    const response = await getOpenAI().responses.parse({
      model: BILL_ANALYSIS_MODEL,
      input: prompt,
      reasoning: { effort: BILL_ANALYSIS_EFFORT },
      text: { format: zodTextFormat(BillAnalysisSchema, "bill_analysis") },
    });
    parsed = response.output_parsed;
  } catch (error) {
    throw new BillAnalysisError("OpenAI request failed", { cause: error });
  }

  if (!parsed) {
    throw new BillAnalysisError(
      "OpenAI returned no parsed analysis (possible refusal)",
    );
  }

  return parsed;
}

export async function fetchBillMarkdown(
  sourceUrl: string,
): Promise<string | null> {
  try {
    const xmlResponse = await fetch(sourceUrl, {
      // Cache bill text for 1 hour in production since it rarely changes
      ...(process.env.NODE_ENV === "production"
        ? { next: { revalidate: 3600 } }
        : { cache: "no-store" }),
    });
    if (xmlResponse.ok) {
      const xml = await xmlResponse.text();
      return xmlToMarkdown(xml);
    }
  } catch (error) {
    console.error("Error fetching bill markdown:", error);
  }
  return null;
}

export async function onBillNotInDatabase(params: {
  billId: string;
  source?: string;
  markdown?: string | null;
  bill: ApiBillDetail;
  analysis: BillAnalysis;
  billTextsCount: number;
  isSocialIssue: boolean;
}): Promise<void> {
  console.log("Saving bill to database:", params.billId);

  // Import here to avoid circular dependencies
  const { connectToDatabase } = await import("@/lib/mongoose");
  const { Bill } = await import("@/models/Bill");

  try {
    const { env } = await import("@/env");
    const uri = env.MONGO_URI || "";
    const hasValidMongoUri =
      uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");

    if (!hasValidMongoUri) {
      console.warn("No valid MongoDB URI, skipping bill save");
      return;
    }

    await connectToDatabase();

    // Check if bill already exists and if we need to update it
    const existing = (await Bill.findOne({ billId: params.billId })
      .lean()
      .exec()) as any;
    if (existing) {
      const countChanged = existing.billTextsCount !== params.billTextsCount;
      const sourceChanged =
        (existing.source || null) !== (params.source || null);
      const existingQP = Array.isArray(existing.question_period_questions)
        ? existing.question_period_questions
        : [];
      const newQP = Array.isArray(params.analysis.question_period_questions)
        ? params.analysis.question_period_questions
        : [];
      const qpMissingOrDifferent =
        (existingQP.length === 0 && newQP.length > 0) ||
        JSON.stringify(existingQP) !== JSON.stringify(newQP);
      const shortTitleMissing =
        !existing.short_title &&
        (params.bill.shortTitle || params.analysis.short_title);

      if (
        sourceChanged ||
        countChanged ||
        qpMissingOrDifferent ||
        shortTitleMissing
      ) {
        if (sourceChanged) {
          console.log(
            `Updating bill ${params.billId} - source changed from ${existing.source || "<none>"} to ${params.source || "<none>"}`,
          );
        } else if (countChanged) {
          console.log(
            `Updating bill ${params.billId} - billTexts count changed from ${existing.billTextsCount} to ${params.billTextsCount}`,
          );
        } else if (qpMissingOrDifferent) {
          console.log(
            `Updating bill ${params.billId} - adding/updating Question Period questions (${existingQP.length} -> ${newQP.length})`,
          );
        } else if (shortTitleMissing) {
          console.log(
            `Updating bill ${params.billId} - adding missing short_title`,
          );
        }

        await Bill.updateOne(
          { billId: params.billId },
          {
            title: params.bill.title,
            short_title: params.bill.shortTitle || params.analysis.short_title,
            summary: params.analysis.summary,
            tenet_evaluations: params.analysis.tenet_evaluations,
            final_judgment: params.analysis.final_judgment,
            rationale: params.analysis.rationale,
            steel_man: params.analysis.steel_man,
            status: params.bill.status,
            sponsorParty: params.bill.sponsorParty,
            genres: params.bill.genres,
            billTextsCount: params.billTextsCount,
            lastUpdatedOn: new Date(),
            isSocialIssue: params.isSocialIssue,
            question_period_questions: newQP,
            source: params.source,
          },
        );
      }
      return;
    }

    // Convert API bill to DB format
    const latestStageDate =
      params.bill.stages && params.bill.stages.length > 0
        ? params.bill.stages[params.bill.stages.length - 1].date
        : (params.bill.updatedAt ?? params.bill.date);

    const classifiedIsSocialIssue = params.isSocialIssue;

    const billData = {
      billId: params.bill.billID,
      parliamentNumber: params.bill.parliamentNumber,
      sessionNumber: params.bill.sessionNumber,
      title: params.bill.title,
      short_title: params.bill.shortTitle || params.analysis.short_title,
      summary: params.analysis.summary,
      tenet_evaluations: params.analysis.tenet_evaluations,
      final_judgment: params.analysis.final_judgment,
      rationale: params.analysis.rationale,
      steel_man: params.analysis.steel_man,
      status: params.bill.status,
      sponsorParty: params.bill.sponsorParty,
      chamber: params.bill.billID.startsWith("S")
        ? "Senate"
        : "House of Commons",
      genres: params.bill.genres,
      supportedRegion: params.bill.supportedRegion,
      introducedOn: new Date(params.bill.date),
      lastUpdatedOn: new Date(latestStageDate),
      source: params.source || params.bill.source,
      stages: params.bill.stages?.map((stage) => ({
        stage: stage.stage,
        state: stage.state,
        house: stage.house,
        date: new Date(stage.date),
      })),
      votes: [], // API doesn't provide detailed vote records
      billTextsCount: params.billTextsCount,
      isSocialIssue: classifiedIsSocialIssue,
      question_period_questions:
        params.analysis.question_period_questions ?? [],
    };

    await Bill.create(billData);
    console.log("Successfully saved bill to database:", params.billId);
  } catch (error) {
    console.error("Error saving bill to database:", error);
    // Don't throw - this shouldn't break the page if DB save fails
  }
}
