#!/usr/bin/env tsx

/**
 * Relevance Analysis Script
 *
 * Analyzes bills for relevance to builders and GDP impact estimation.
 * Fetches bills from Civics Project API, converts to markdown,
 * sends to OpenAI for analysis, and outputs results to CSV.
 *
 * Usage:
 *   tsx src/scripts/relevance-analysis.ts [options]
 *
 * Options:
 *   --bills <number>     Number of bills to analyze (default: 30)
 *   --output <path>      Output CSV file path (default: outputs/relevance-analysis-YYYY-MM-DD.csv)
 *   --dry-run           Preview actions without executing
 *
 * Examples:
 *   tsx src/scripts/relevance-analysis.ts
 *   tsx src/scripts/relevance-analysis.ts --bills 50 --output my-analysis.csv
 *   tsx src/scripts/relevance-analysis.ts --dry-run
 */

import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
import { createObjectCsvWriter } from "csv-writer";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { getBillsFromCivicsProject } from "@/server/get-all-bills-from-civics-project";
import {
  getBillFromCivicsProjectApi,
  fetchBillMarkdown,
} from "@/services/billApi";
import { RELEVANCE_ANALYSIS_PROMPT } from "@/prompt/relevance-analysis-prompt";
import OpenAI from "openai";

interface ParsedArgs {
  bills: number;
  output: string;
  dryRun: boolean;
}

interface RelevanceAnalysis {
  bill_id: string;
  title: string;
  relevance_score: number;
  gdp_impact_percent: number;
  gdp_impact_confidence: string;
  gdp_impact_justification: string;
  relevance_justification: string;
  primary_mechanism: string;
  implementation_timeline: string;
  analysis_timestamp: string;
  error?: string;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const parsed: ParsedArgs = {
    bills: 30,
    output: "",
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--bills") {
      const value = parseInt(args[++i], 10);
      if (Number.isNaN(value) || value < 1) {
        throw new Error("--bills must be a positive number");
      }
      parsed.bills = value;
    } else if (arg === "--output") {
      parsed.output = args[++i];
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  // Set default output path if not provided
  if (!parsed.output) {
    const timestamp = new Date().toISOString().split("T")[0];
    parsed.output = `outputs/relevance-analysis-${timestamp}.csv`;
  }

  return parsed;
}

async function ensureOutputDirectory(outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Created output directory: ${dir}`);
  }
}

async function analyzeBillRelevance(
  billId: string,
  _title: string,
  markdown: string,
  openaiClient: OpenAI,
): Promise<Omit<
  RelevanceAnalysis,
  "bill_id" | "title" | "analysis_timestamp"
> | null> {
  try {
    const prompt = `${RELEVANCE_ANALYSIS_PROMPT}\n\nBill Text:\n${markdown}`;

    const response = await openaiClient.responses.create({
      model: "gpt-5",
      input: prompt,
      reasoning: {
        effort: "high",
      },
    });
    const responseText = response.output_text;
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    try {
      const parsed = JSON.parse(responseText);
      return {
        relevance_score: parsed.relevance_score || 0,
        gdp_impact_percent: parsed.gdp_impact_percent || 0,
        gdp_impact_confidence: parsed.gdp_impact_confidence || "unknown",
        gdp_impact_justification:
          parsed.gdp_impact_justification || "No justification provided",
        relevance_justification:
          parsed.relevance_justification || "No justification provided",
        primary_mechanism: parsed.primary_mechanism || "Not specified",
        implementation_timeline:
          parsed.implementation_timeline || "Not specified",
      };
    } catch (parseError) {
      console.error(`Failed to parse JSON for ${billId}:`, parseError);
      console.log("Raw response:", responseText);
      return {
        relevance_score: 0,
        gdp_impact_percent: 0,
        gdp_impact_confidence: "unknown",
        gdp_impact_justification: "Failed to parse AI response",
        relevance_justification: "Failed to parse AI response",
        primary_mechanism: "Not specified",
        implementation_timeline: "Not specified",
        error: "JSON parse error",
      };
    }
  } catch (error) {
    console.error(`Error analyzing ${billId}:`, error);
    return {
      relevance_score: 0,
      gdp_impact_percent: 0,
      gdp_impact_confidence: "unknown",
      gdp_impact_justification: "Analysis failed",
      relevance_justification: "Analysis failed",
      primary_mechanism: "Not specified",
      implementation_timeline: "Not specified",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function main() {
  try {
    const args = parseArgs();

    if (args.dryRun) {
      console.log("[DRY RUN MODE ENABLED]");
      console.log(`Would analyze ${args.bills} bills`);
      console.log(`Would output to: ${args.output}`);
      return;
    }

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required");
    }
    if (!process.env.CIVICS_PROJECT_API_KEY) {
      throw new Error("CIVICS_PROJECT_API_KEY is required");
    }

    console.log(`Starting relevance analysis for ${args.bills} bills...`);
    console.log(`Output file: ${args.output}`);

    // Ensure output directory exists
    await ensureOutputDirectory(args.output);

    // Initialize OpenAI client
    const openaiClient = new OpenAI();

    // Fetch bills from API
    console.log("Fetching bills from Civics Project API...");
    const allBills = await getBillsFromCivicsProject();
    const billsToAnalyze = allBills.slice(0, args.bills);
    console.log(
      `Found ${allBills.length} total bills, analyzing first ${billsToAnalyze.length}`,
    );

    const results: RelevanceAnalysis[] = [];
    const timestamp = new Date().toISOString();

    // Process each bill
    for (let i = 0; i < billsToAnalyze.length; i++) {
      const bill = billsToAnalyze[i];
      console.log(
        `\n[${i + 1}/${billsToAnalyze.length}] Analyzing ${bill.billID}: ${bill.title}`,
      );

      try {
        // Fetch detailed bill data
        const billDetail = await getBillFromCivicsProjectApi(bill.billID);
        if (!billDetail) {
          console.log(`  ❌ Bill ${bill.billID} not found in detailed API`);
          results.push({
            bill_id: bill.billID,
            title: bill.title,
            relevance_score: 0,
            gdp_impact_percent: 0,
            gdp_impact_confidence: "unknown",
            gdp_impact_justification: "Bill not found in detailed API",
            relevance_justification: "Bill not found in detailed API",
            primary_mechanism: "Not specified",
            implementation_timeline: "Not specified",
            analysis_timestamp: timestamp,
            error: "Bill not found",
          });
          continue;
        }

        // Fetch bill markdown
        let markdown: string | null = null;
        if (billDetail.source) {
          console.log(`  📄 Fetching bill text from: ${billDetail.source}`);
          markdown = await fetchBillMarkdown(billDetail.source);
        }

        if (!markdown) {
          console.log(`  ❌ No markdown available for ${bill.billID}`);
          results.push({
            bill_id: bill.billID,
            title: bill.title,
            relevance_score: 0,
            gdp_impact_percent: 0,
            gdp_impact_confidence: "unknown",
            gdp_impact_justification: "No bill text available",
            relevance_justification: "No bill text available",
            primary_mechanism: "Not specified",
            implementation_timeline: "Not specified",
            analysis_timestamp: timestamp,
            error: "No markdown",
          });
          continue;
        }

        console.log(`  🤖 Analyzing with OpenAI (${markdown.length} chars)...`);
        const analysis = await analyzeBillRelevance(
          bill.billID,
          bill.title,
          markdown,
          openaiClient,
        );

        if (analysis) {
          results.push({
            bill_id: bill.billID,
            title: bill.title,
            ...analysis,
            analysis_timestamp: timestamp,
          });
          console.log(
            `  ✅ Relevance: ${analysis.relevance_score}/10, GDP Impact: ${analysis.gdp_impact_percent}%`,
          );
        } else {
          console.log(`  ❌ Analysis failed for ${bill.billID}`);
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Error processing ${bill.billID}:`, error);
        results.push({
          bill_id: bill.billID,
          title: bill.title,
          relevance_score: 0,
          gdp_impact_percent: 0,
          gdp_impact_confidence: "unknown",
          gdp_impact_justification: "Processing error",
          relevance_justification: "Processing error",
          primary_mechanism: "Not specified",
          implementation_timeline: "Not specified",
          analysis_timestamp: timestamp,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Write results to CSV
    console.log(`\n📊 Writing results to ${args.output}...`);
    const csvWriter = createObjectCsvWriter({
      path: args.output,
      header: [
        { id: "bill_id", title: "Bill ID" },
        { id: "title", title: "Title" },
        { id: "relevance_score", title: "Relevance Score (1-10)" },
        { id: "gdp_impact_percent", title: "GDP Impact %" },
        { id: "gdp_impact_confidence", title: "GDP Impact Confidence" },
        { id: "gdp_impact_justification", title: "GDP Impact Justification" },
        { id: "relevance_justification", title: "Relevance Justification" },
        { id: "primary_mechanism", title: "Primary Mechanism" },
        { id: "implementation_timeline", title: "Implementation Timeline" },
        { id: "analysis_timestamp", title: "Analysis Timestamp" },
        { id: "error", title: "Error" },
      ],
    });

    await csvWriter.writeRecords(results);

    // Summary
    const successful = results.filter((r) => !r.error).length;
    const failed = results.filter((r) => r.error).length;
    const avgRelevance =
      successful > 0
        ? (
            results
              .filter((r) => !r.error)
              .reduce((sum, r) => sum + r.relevance_score, 0) / successful
          ).toFixed(2)
        : 0;
    const avgGdpImpact =
      successful > 0
        ? (
            results
              .filter((r) => !r.error)
              .reduce((sum, r) => sum + r.gdp_impact_percent, 0) / successful
          ).toFixed(2)
        : 0;

    console.log(`\n✅ Analysis complete!`);
    console.log(`📈 Results: ${successful} successful, ${failed} failed`);
    console.log(`📊 Average relevance score: ${avgRelevance}/10`);
    console.log(`📊 Average GDP impact: ${avgGdpImpact}%`);
    console.log(`📁 Output saved to: ${args.output}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
