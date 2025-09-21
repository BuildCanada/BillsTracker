import { xmlToMarkdown } from "@/utils/xml-to-md/xml-to-md.util";
import { SUMMARY_AND_VOTE_PROMPT } from "@/prompt/summary-and-vote-prompt";
import OpenAI from "openai";
import { socialIssueGrader } from "@/services/social-issue-grader";


export type ApiStage = { stage: string; state: string; house: string; date: string };

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

export async function getBillFromApi(billId: string): Promise<ApiBillDetail | null> {
  const URL = `https://api.civicsproject.org/bills/canada/${billId.toLowerCase()}/${CANADIAN_PARLIAMENT_NUMBER}`;
  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIVICS_PROJECT_API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch bill details");
  }
  const json = await response.json();
  const data = (json?.data?.bill ?? json?.data ?? json) as ApiBillDetail | ApiBillDetail[] | null;
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.find((b) => b.billID?.toLowerCase() === billId.toLowerCase()) ?? null;
  }
  return data;
}

export interface BillAnalysis {
  summary: string;
  short_title?: string;
  tenet_evaluations: Array<{
    id: number;
    title: string;
    alignment: "aligns" | "conflicts" | "neutral";
    explanation: string;
  }>;
  final_judgment: "yes" | "no" | "neutral";
  rationale: string;
  needs_more_info: boolean;
  missing_details: string[];
  steel_man: string;
  question_period_questions?: Array<{ question: string }>;
}

export async function summarizeBillText(input: string): Promise<BillAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('No OPENAI API key, using fallback analysis');
    // Fallback analysis
    const text = input?.trim() || "";
    const truncatedSummary = text.length <= 500 ? text : text.slice(0, 500) + "…";

    return {
      summary: truncatedSummary || "No bill text available for analysis.",
      short_title: undefined,
      tenet_evaluations: [
        { id: 1, title: "Canada should aim to be the world's richest country", alignment: "neutral", explanation: "Unable to analyze without AI" },
        { id: 2, title: "Promote economic freedom, ambition, and breaking from bureaucratic inertia", alignment: "neutral", explanation: "Unable to analyze without AI" },
        { id: 3, title: "Drive national productivity and global competitiveness", alignment: "neutral", explanation: "Unable to analyze without AI" },
        { id: 4, title: "Grow exports of Canadian products and resources", alignment: "neutral", explanation: "Unable to analyze without AI" },
        { id: 5, title: "Encourage investment, innovation, and resource development", alignment: "neutral", explanation: "Unable to analyze without AI" },
        { id: 6, title: "Deliver better public services at lower cost (government efficiency)", alignment: "neutral", explanation: "Unable to analyze without AI" },
        { id: 7, title: "Reform taxes to incentivize work, risk-taking, and innovation", alignment: "neutral", explanation: "Unable to analyze without AI" },
        { id: 8, title: "Focus on large-scale prosperity, not incrementalism", alignment: "neutral", explanation: "Unable to analyze without AI" },
      ],
      final_judgment: "no",
      rationale: "Analysis requires AI capabilities",
      needs_more_info: true,
      missing_details: ["AI analysis capabilities required"],
      steel_man: "The steel man for this bill is the bill that aligns with the tenets of Build Canada.",
      question_period_questions: []
    };
  }

  try {
    console.log('Analyzing bill text with AI');
    const OpenAIClient = new OpenAI();



    const prompt = `${SUMMARY_AND_VOTE_PROMPT}\n\nBill Text:\n${input}`;
    const response = await OpenAIClient.responses.create({
      model: "gpt-5",
      input: prompt,
      reasoning: {
        effort: "high"
      }
    });
    const responseText = response.output_text

    // Parse JSON response
    try {
      const parsed = JSON.parse(responseText);
      const analysis: BillAnalysis = {
        summary: parsed.summary ?? "",
        short_title: parsed.short_title ?? undefined,
        tenet_evaluations: parsed.tenet_evaluations ?? [],
        final_judgment: parsed.final_judgment ?? "no",
        rationale: parsed.rationale ?? "",
        needs_more_info: parsed.needs_more_info ?? false,
        missing_details: parsed.missing_details ?? [],
        steel_man: parsed.steel_man ?? "",
        question_period_questions: Array.isArray(parsed.question_period_questions)
          ? parsed.question_period_questions
          : [],
      };
      return analysis;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Raw response:", responseText);

      // Fallback to extracting summary from text response
      const summaryMatch = responseText.match(/summary['":\s]*["']([^"']+)["']/i);
      const summary = summaryMatch ? summaryMatch[1] : responseText.slice(0, 500) + "…";

      return {
        summary,
        short_title: undefined,
        tenet_evaluations: [
          { id: 1, title: "Canada should aim to be the world's richest country", alignment: "neutral", explanation: "JSON parse failed" },
          { id: 2, title: "Promote economic freedom, ambition, and breaking from bureaucratic inertia", alignment: "neutral", explanation: "JSON parse failed" },
          { id: 3, title: "Drive national productivity and global competitiveness", alignment: "neutral", explanation: "JSON parse failed" },
          { id: 4, title: "Grow exports of Canadian products and resources", alignment: "neutral", explanation: "JSON parse failed" },
          { id: 5, title: "Encourage investment, innovation, and resource development", alignment: "neutral", explanation: "JSON parse failed" },
          { id: 6, title: "Deliver better public services at lower cost (government efficiency)", alignment: "neutral", explanation: "JSON parse failed" },
          { id: 7, title: "Reform taxes to incentivize work, risk-taking, and innovation", alignment: "neutral", explanation: "JSON parse failed" },
          { id: 8, title: "Focus on large-scale prosperity, not incrementalism", alignment: "neutral", explanation: "JSON parse failed" },
        ],
        final_judgment: "no",
        rationale: "Analysis parsing failed",
        needs_more_info: true,
        missing_details: ["Valid AI response format"],
        steel_man: "Analysis parsing failed",
        question_period_questions: []
      };
    }
  } catch (error) {
    console.error("Error analyzing bill:", error);
    // Fallback analysis
    const text = input?.trim() || "";
    const truncatedSummary = text.length <= 500 ? text : text.slice(0, 500) + "…";

    return {
      summary: truncatedSummary || "Error occurred during analysis.",
      short_title: undefined,
      tenet_evaluations: [
        { id: 1, title: "Canada should aim to be the world's richest country", alignment: "neutral", explanation: "Analysis failed" },
        { id: 2, title: "Promote economic freedom, ambition, and breaking from bureaucratic inertia", alignment: "neutral", explanation: "Analysis failed" },
        { id: 3, title: "Drive national productivity and global competitiveness", alignment: "neutral", explanation: "Analysis failed" },
        { id: 4, title: "Grow exports of Canadian products and resources", alignment: "neutral", explanation: "Analysis failed" },
        { id: 5, title: "Encourage investment, innovation, and resource development", alignment: "neutral", explanation: "Analysis failed" },
        { id: 6, title: "Deliver better public services at lower cost (government efficiency)", alignment: "neutral", explanation: "Analysis failed" },
        { id: 7, title: "Reform taxes to incentivize work, risk-taking, and innovation", alignment: "neutral", explanation: "Analysis failed" },
        { id: 8, title: "Focus on large-scale prosperity, not incrementalism", alignment: "neutral", explanation: "Analysis failed" },
      ],
      final_judgment: "no",
      rationale: "Technical error during analysis",
      needs_more_info: true,
      missing_details: ["Technical issue resolution"],
      steel_man: "Technical error during analysis",
      question_period_questions: []
    };
  }
}

export async function fetchBillMarkdown(sourceUrl: string): Promise<string | null> {
  try {
    const xmlResponse = await fetch(sourceUrl, { cache: "no-store" });
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
    const uri = process.env.MONGO_URI || "";
    const hasValidMongoUri = uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");

    if (!hasValidMongoUri) {
      console.warn("No valid MongoDB URI, skipping bill save");
      return;
    }

    await connectToDatabase();

    // Check if bill already exists and if we need to update it
    const existing = (await Bill.findOne({ billId: params.billId }).lean().exec()) as any;
    if (existing) {
      const countChanged = existing.billTextsCount !== params.billTextsCount;
      const existingQP = Array.isArray(existing.question_period_questions) ? existing.question_period_questions : [];
      const newQP = Array.isArray(params.analysis.question_period_questions) ? params.analysis.question_period_questions : [];
      const qpMissingOrDifferent = (existingQP.length === 0 && newQP.length > 0) || JSON.stringify(existingQP) !== JSON.stringify(newQP);
      const shortTitleMissing = !existing.short_title && (params.bill.shortTitle || params.analysis.short_title);

      if (countChanged || qpMissingOrDifferent || shortTitleMissing) {
        if (countChanged) {
          console.log(`Updating bill ${params.billId} - billTexts count changed from ${existing.billTextsCount} to ${params.billTextsCount}`);
        } else if (qpMissingOrDifferent) {
          console.log(`Updating bill ${params.billId} - adding/updating Question Period questions (${existingQP.length} -> ${newQP.length})`);
        } else if (shortTitleMissing) {
          console.log(`Updating bill ${params.billId} - adding missing short_title`);
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
            needs_more_info: params.analysis.needs_more_info,
            missing_details: params.analysis.missing_details,
            steel_man: params.analysis.steel_man,
            status: params.bill.status,
            sponsorParty: params.bill.sponsorParty,
            genres: params.bill.genres,
            billTextsCount: params.billTextsCount,
            lastUpdatedOn: new Date(),
            isSocialIssue: params.isSocialIssue,
            question_period_questions: newQP,
          }
        );
      }
      return;
    }

    // Convert API bill to DB format
    const latestStageDate = params.bill.stages && params.bill.stages.length > 0
      ? params.bill.stages[params.bill.stages.length - 1].date
      : params.bill.updatedAt ?? params.bill.date;

    const house = params.bill.stages && params.bill.stages.length > 0
      ? params.bill.stages[params.bill.stages.length - 1].house
      : undefined;

    const classifiedIsSocialIssue = params.isSocialIssue

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
      needs_more_info: params.analysis.needs_more_info,
      missing_details: params.analysis.missing_details,
      steel_man: params.analysis.steel_man,
      status: params.bill.status,
      sponsorParty: params.bill.sponsorParty,
      chamber: house as "House of Commons" | "Senate" | undefined,
      genres: params.bill.genres,
      supportedRegion: params.bill.supportedRegion,
      introducedOn: new Date(params.bill.date),
      lastUpdatedOn: new Date(latestStageDate),
      source: params.bill.source,
      stages: params.bill.stages?.map(stage => ({
        stage: stage.stage,
        state: stage.state,
        house: stage.house,
        date: new Date(stage.date),
      })),
      votes: [], // API doesn't provide detailed vote records
      billTextsCount: params.billTextsCount,
      isSocialIssue: classifiedIsSocialIssue,
      question_period_questions: params.analysis.question_period_questions ?? [],
    };

    await Bill.create(billData);
    console.log("Successfully saved bill to database:", params.billId);

  } catch (error) {
    console.error("Error saving bill to database:", error);
    // Don't throw - this shouldn't break the page if DB save fails
  }
}
