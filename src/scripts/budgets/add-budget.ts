#!/usr/bin/env tsx

/**
 * Add Budget Bill Script
 *
 * Add a manual budget bill to the database from TypeScript files containing budget analysis and metadata.
 *
 * Usage:
 *
 * 1. Add budget-2025 with data from budget-2024 files (for testing)
 *    tsx src/scripts/budgets/add-budget.ts --bill-id budget-2025 --file src/scripts/budgets/budget-2024.ts --meta src/scripts/budgets/budget-2024-meta.ts
 *
 * 2. Add budget-2025 with data from budget-2025 files (when ready)
 *    tsx src/scripts/budgets/add-budget.ts --bill-id budget-2025 --file src/scripts/budgets/budget-2025.ts --meta src/scripts/budgets/budget-2025-meta.ts
 *
 * Required Flags:
 *   --bill-id <id>   The bill ID to create in the system (e.g., "budget-2025")
 *   --file <path>    Path to the TypeScript file containing budget analysis data (e.g., "src/scripts/budgets/budget-2024.ts")
 *   --meta <path>    Path to the TypeScript file containing budget metadata (e.g., "src/scripts/budgets/budget-2024-meta.ts")
 *
 * Notes:
 * - Run this script from the repository root so paths resolve correctly.
 * - The analysis file (--file) must export a constant object with:
 *   - summary: string
 *   - short_title: string
 *   - tenet_evaluations: Array<{id, title, alignment, explanation}>
 *   - question_period_questions: Array<{question}>
 *   - final_judgment: "yes" | "no" | "abstain"
 *   - rationale: string
 *   - needs_more_info: boolean (optional)
 *   - missing_details: string[] (optional)
 *   - steel_man: string (optional)
 * - The metadata file (--meta) must export a constant object with:
 *   - title: string (required)
 *   - status: string (required)
 *   - chamber: "House of Commons" | "Senate" (required)
 *   - sponsorParty: string (optional)
 *   - sponsorName: string (optional)
 *   - introducedOn: Date (optional)
 *   - lastUpdatedOn: Date (optional)
 *   - genres: string[] (optional)
 *   - supportedRegion: string (optional)
 *   - source: string (optional)
 *   - stages: StageRecord[] (optional)
 *   - votes: VoteRecord[] (optional)
 *   - isSocialIssue: boolean (optional)
 * - If a bill with the same billId already exists, it will be updated.
 * - Defaults to dev environment. Use --env prod to target production.
 * - This script does not use default values - all required fields must be present in the files.
 */

import dotenv from "dotenv";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  Environment,
  getMongoUri,
  promptForConfirmation,
  redactMongoUri,
} from "../utils";

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

interface ParsedArgs {
  billId: string | null;
  filePath: string | null;
  metaPath: string | null;
  environment: Environment;
}

function defaultParsedArgs(): ParsedArgs {
  return {
    billId: null,
    filePath: null,
    metaPath: null,
    environment: "dev",
  };
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed = defaultParsedArgs();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--bill-id" || arg === "--billId") {
      const value = argv[++i];
      if (!value) {
        throw new Error(`${arg} requires a value`);
      }
      parsed.billId = value;
      continue;
    }

    if (arg.startsWith("--bill-id=") || arg.startsWith("--billId=")) {
      const [, value] = arg.split("=", 2);
      if (!value) {
        throw new Error(`Invalid argument format: ${arg}`);
      }
      parsed.billId = value;
      continue;
    }

    if (arg === "--file" || arg === "--file-path") {
      const value = argv[++i];
      if (!value) {
        throw new Error(`${arg} requires a value`);
      }
      parsed.filePath = value;
      continue;
    }

    if (arg.startsWith("--file=") || arg.startsWith("--file-path=")) {
      const [, value] = arg.split("=", 2);
      if (!value) {
        throw new Error(`Invalid argument format: ${arg}`);
      }
      parsed.filePath = value;
      continue;
    }

    if (arg === "--meta" || arg === "--meta-path") {
      const value = argv[++i];
      if (!value) {
        throw new Error(`${arg} requires a value`);
      }
      parsed.metaPath = value;
      continue;
    }

    if (arg.startsWith("--meta=") || arg.startsWith("--meta-path=")) {
      const [, value] = arg.split("=", 2);
      if (!value) {
        throw new Error(`Invalid argument format: ${arg}`);
      }
      parsed.metaPath = value;
      continue;
    }

    if (arg === "--env" || arg === "--environment" || arg === "--target") {
      const value = argv[++i];
      if (!value) {
        throw new Error(`${arg} requires a value (dev|prod)`);
      }
      parsed.environment = parseEnvironment(value);
      continue;
    }

    if (
      arg.startsWith("--env=") ||
      arg.startsWith("--environment=") ||
      arg.startsWith("--target=")
    ) {
      const [, value] = arg.split("=", 2);
      if (!value) {
        throw new Error(`Invalid argument format: ${arg}`);
      }
      parsed.environment = parseEnvironment(value);
      continue;
    }

    if (arg === "--prod") {
      parsed.environment = "prod";
      continue;
    }

    if (arg === "--dev") {
      parsed.environment = "dev";
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function parseEnvironment(value: string): Environment {
  const normalized = value.toLowerCase();
  if (normalized === "dev") return "dev";
  if (normalized === "prod" || normalized === "production") return "prod";
  throw new Error(`Invalid environment '${value}'. Use 'dev' or 'prod'.`);
}

function usage(): void {
  console.error(
    "Usage: tsx src/scripts/budgets/add-budget.ts --bill-id <id> --file <path> --meta <path> [--env <dev|prod>]",
  );
  console.error("");
  console.error("Required Flags:");
  console.error(
    "  --bill-id <id>   The bill ID to create (e.g., 'budget-2025')",
  );
  console.error(
    "  --file <path>     Path to budget analysis file (e.g., 'src/scripts/budgets/budget-2024.ts')",
  );
  console.error(
    "  --meta <path>     Path to budget metadata file (e.g., 'src/scripts/budgets/budget-2024-meta.ts')",
  );
  console.error("");
  console.error("Optional Flags:");
  console.error("  --env <dev|prod> Target environment (default: dev)");
  console.error("");
  console.error("Examples:");
  console.error(
    "  tsx src/scripts/budgets/add-budget.ts --bill-id budget-2025 --file src/scripts/budgets/budget-2024.ts --meta src/scripts/budgets/budget-2024-meta.ts",
  );
  console.error(
    "  tsx src/scripts/budgets/add-budget.ts --bill-id budget-2025 --file src/scripts/budgets/budget-2025.ts --meta src/scripts/budgets/budget-2025-meta.ts --env prod",
  );
}

function resolveFilePath(input: string): {
  absolutePath: string;
  displayPath: string;
} {
  const normalizedInput = path.normalize(input);

  let candidateAbsolute: string;
  if (path.isAbsolute(normalizedInput)) {
    candidateAbsolute = normalizedInput;
  } else {
    candidateAbsolute = path.resolve(process.cwd(), normalizedInput);
  }

  const displayPath = path.relative(process.cwd(), candidateAbsolute);
  return {
    absolutePath: candidateAbsolute,
    displayPath: displayPath || normalizedInput,
  };
}

async function loadBudgetFile(
  absolutePath: string,
  displayPath: string,
  expectedFields: string[],
): Promise<any> {
  try {
    const module = await import(pathToFileURL(absolutePath).href);
    const exports = Object.keys(module);
    if (exports.length === 0) {
      throw new Error("No exports found in file");
    }

    // Try to find the export that matches the expected structure
    const matchedExport = exports.find((key) => {
      const value = module[key];
      return (
        typeof value === "object" &&
        value !== null &&
        expectedFields.every((field) => field in value)
      );
    });

    if (!matchedExport) {
      // If no perfect match, try the first export that has at least some expected fields
      const firstExport = exports[0];
      const firstValue = module[firstExport];
      if (
        typeof firstValue === "object" &&
        firstValue !== null &&
        expectedFields.some((field) => field in firstValue)
      ) {
        return firstValue;
      }
      throw new Error(
        `Could not find export with required fields [${expectedFields.join(", ")}]. Found exports: ${exports.join(", ")}`,
      );
    }

    return module[matchedExport];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load file ${displayPath}: ${message}`);
  }
}

function validateRequiredFields(
  data: any,
  requiredFields: string[],
  source: string,
): void {
  const missing: string[] = [];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    throw new Error(`${source} missing required fields: ${missing.join(", ")}`);
  }
}

async function addBudget({
  billId,
  filePath,
  metaPath,
  environment,
}: {
  billId: string;
  filePath: string;
  metaPath: string;
  environment: Environment;
}): Promise<void> {
  const { absolutePath: analysisPath, displayPath: analysisDisplay } =
    resolveFilePath(filePath);
  const { absolutePath: metaAbsPath, displayPath: metaDisplay } =
    resolveFilePath(metaPath);
  const mongoUri = await getMongoUri(environment);
  const redactedUri = redactMongoUri(mongoUri);
  const action = `Add budget bill '${billId}' to ${environment} database`;

  console.log(`\nAction: ${action}`);
  console.log(`Target environment: ${environment}`);
  console.log(`Mongo URI: ${redactedUri}`);
  console.log(`Bill ID: ${billId}`);
  console.log(`Analysis file: ${analysisDisplay}`);
  console.log(`Metadata file: ${metaDisplay}`);
  console.log("");

  // Load analysis data (from --file)
  const analysisData = await loadBudgetFile(analysisPath, analysisDisplay, [
    "summary",
    "short_title",
    "final_judgment",
    "rationale",
  ]);

  // Load metadata (from --meta)
  const metaData = await loadBudgetFile(metaAbsPath, metaDisplay, [
    "title",
    "status",
    "chamber",
  ]);

  // Validate required fields from analysis file
  validateRequiredFields(
    analysisData,
    ["summary", "short_title", "final_judgment", "rationale"],
    "Analysis file",
  );

  // Validate required fields from metadata file
  validateRequiredFields(
    metaData,
    ["title", "status", "chamber"],
    "Metadata file",
  );

  // Validate chamber enum
  if (
    metaData.chamber !== "House of Commons" &&
    metaData.chamber !== "Senate"
  ) {
    throw new Error(
      `Invalid chamber value: ${metaData.chamber}. Must be "House of Commons" or "Senate"`,
    );
  }

  // Validate final_judgment enum
  if (!["yes", "no", "abstain"].includes(analysisData.final_judgment)) {
    throw new Error(
      `Invalid final_judgment value: ${analysisData.final_judgment}. Must be "yes", "no", or "abstain"`,
    );
  }

  // Set environment variables for mongoose connection
  process.env.MONGO_URI = mongoUri;
  process.env.MONGODB_URI = mongoUri;

  const confirmed = await promptForConfirmation("Press Y + Enter to continue");
  if (!confirmed) {
    console.log("Operation cancelled.");
    return;
  }

  if (environment === "prod") {
    const prodConfirmed = await promptForConfirmation(
      "This will modify the production database. Press Y + Enter to continue",
    );
    if (!prodConfirmed) {
      console.log("Operation cancelled.");
      return;
    }
  }

  const { connectToDatabase } = await import("@/lib/mongoose");
  const { Bill } = await import("@/models/Bill");

  console.log("Connecting to MongoDB...");
  await connectToDatabase();

  // Check if bill already exists
  const existing = await Bill.findOne({ billId }).lean().exec();
  if (existing) {
    console.log(`Bill with ID '${billId}' already exists. It will be updated.`);
  }

  // Merge analysis and metadata into bill document structure
  // No defaults - all values must come from the files
  const billData: any = {
    billId,
    title: metaData.title,
    short_title: analysisData.short_title,
    summary: analysisData.summary,
    final_judgment: analysisData.final_judgment,
    rationale: analysisData.rationale,
    status: metaData.status,
    chamber: metaData.chamber,
  };

  // Add optional analysis fields only if they exist
  if (analysisData.tenet_evaluations !== undefined) {
    billData.tenet_evaluations = analysisData.tenet_evaluations;
  }
  if (analysisData.question_period_questions !== undefined) {
    billData.question_period_questions = analysisData.question_period_questions;
  }
  if (analysisData.needs_more_info !== undefined) {
    billData.needs_more_info = analysisData.needs_more_info;
  }
  if (analysisData.missing_details !== undefined) {
    billData.missing_details = analysisData.missing_details;
  }
  if (analysisData.steel_man !== undefined) {
    billData.steel_man = analysisData.steel_man;
  }

  // Add optional metadata fields only if they exist
  if (metaData.sponsorParty !== undefined) {
    billData.sponsorParty = metaData.sponsorParty;
  }
  if (metaData.sponsorName !== undefined) {
    billData.sponsorName = metaData.sponsorName;
  }
  if (metaData.genres !== undefined) {
    billData.genres = metaData.genres;
  }
  if (metaData.supportedRegion !== undefined) {
    billData.supportedRegion = metaData.supportedRegion;
  }
  if (metaData.source !== undefined) {
    billData.source = metaData.source;
  }
  if (metaData.introducedOn !== undefined) {
    billData.introducedOn =
      metaData.introducedOn instanceof Date
        ? metaData.introducedOn
        : new Date(metaData.introducedOn);
  }
  if (metaData.lastUpdatedOn !== undefined) {
    billData.lastUpdatedOn =
      metaData.lastUpdatedOn instanceof Date
        ? metaData.lastUpdatedOn
        : new Date(metaData.lastUpdatedOn);
  }
  if (metaData.stages !== undefined) {
    billData.stages = metaData.stages.map((stage: any) => ({
      ...stage,
      date: stage.date instanceof Date ? stage.date : new Date(stage.date),
    }));
  }
  if (metaData.votes !== undefined) {
    billData.votes = metaData.votes.map((vote: any) => ({
      ...vote,
      date: vote.date instanceof Date ? vote.date : new Date(vote.date),
    }));
  }
  if (metaData.isSocialIssue !== undefined) {
    billData.isSocialIssue = metaData.isSocialIssue;
  }
  if (metaData.parliamentNumber !== undefined) {
    billData.parliamentNumber = metaData.parliamentNumber;
  }
  if (metaData.sessionNumber !== undefined) {
    billData.sessionNumber = metaData.sessionNumber;
  }
  if (metaData.billTextsCount !== undefined) {
    billData.billTextsCount = metaData.billTextsCount;
  }

  if (existing) {
    await Bill.updateOne({ billId }, billData);
    console.log(`Successfully updated bill '${billId}' in database`);
  } else {
    await Bill.create(billData);
    console.log(`Successfully created bill '${billId}' in database`);
  }
}

async function main(): Promise<void> {
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    console.error("");
    usage();
    process.exit(1);
  }

  if (!parsed.billId) {
    console.error("Error: --bill-id is required");
    console.error("");
    usage();
    process.exit(1);
  }

  if (!parsed.filePath) {
    console.error("Error: --file is required");
    console.error("");
    usage();
    process.exit(1);
  }

  if (!parsed.metaPath) {
    console.error("Error: --meta is required");
    console.error("");
    usage();
    process.exit(1);
  }

  await addBudget({
    billId: parsed.billId,
    filePath: parsed.filePath,
    metaPath: parsed.metaPath,
    environment: parsed.environment,
  });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Operation failed:", error);
    process.exit(1);
  });
