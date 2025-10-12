#!/usr/bin/env tsx

/**
 * Database Migration Runner
 *
 * Run or preview migrations against the dev or production MongoDB databases.
 *
 * Available Actions:
 *
 * 1. Run a migration against the dev database (default)
 *    tsx src/scripts/migrate.ts 1.ts
 *
 * 2. Explicitly target dev
 *    tsx src/scripts/migrate.ts 2-add-indexes.ts --env dev
 *
 * 3. Run a migration against production (requires confirmation)
 *    tsx src/scripts/migrate.ts 3-new-field.ts --env prod
 *
 * 4. Preview without executing
 *    tsx src/scripts/migrate.ts 3-new-field.ts --env prod --dry-run
 *
 * Global Options:
 *   --env <dev|prod>   Target environment (default: dev)
 *   --dry-run          Log actions without connecting or mutating data
 */

import dotenv from "dotenv";
import path from "node:path";
import {
  Environment,
  getMongoUri,
  promptForConfirmation,
  redactMongoUri,
} from "./utils";

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

interface ParsedArgs {
  filename: string | null;
  environment: Environment;
  dryRun: boolean;
}

function defaultParsedArgs(): ParsedArgs {
  return {
    filename: null,
    environment: "dev",
    dryRun: false,
  };
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed = defaultParsedArgs();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--dry-run") {
      parsed.dryRun = true;
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

    if (!arg.startsWith("-") && parsed.filename === null) {
      parsed.filename = arg;
      continue;
    }

    if (!arg.startsWith("-") && parsed.filename !== null) {
      throw new Error(`Unexpected extra argument: ${arg}`);
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
    "Usage: tsx src/scripts/migrate.ts <migration-filename> [--env <dev|prod>] [--dry-run]",
  );
  console.error("Examples:");
  console.error("  tsx src/scripts/migrate.ts 1.ts");
  console.error("  tsx src/scripts/migrate.ts 1.ts --env prod");
  console.error("  tsx src/scripts/migrate.ts 1.ts --env prod --dry-run");
}

async function loadMigrationModule(filename: string) {
  const migrationPath = path.join(process.cwd(), "src/migrations", filename);
  try {
    const migration = await import(migrationPath);
    return migration as { up?: () => unknown };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load migration ${filename}: ${message}`);
  }
}

async function runMigration({
  filename,
  environment,
  dryRun,
}: {
  filename: string;
  environment: Environment;
  dryRun: boolean;
}): Promise<void> {
  const mongoUri = await getMongoUri(environment);
  const redactedUri = redactMongoUri(mongoUri);
  const action = `Run migration '${filename}' on ${environment} database`;

  console.log(`\nAction: ${action}`);
  console.log(`Target environment: ${environment}`);
  console.log(`Mongo URI: ${redactedUri}`);
  console.log(`Migration file: ${filename}`);
  console.log("");

  const migrationModule = await loadMigrationModule(filename);
  if (typeof migrationModule.up !== "function") {
    throw new Error(`Migration ${filename} must export an 'up' function`);
  }

  if (dryRun) {
    console.log("[DRY RUN] Migration module loaded successfully.");
    console.log(
      "[DRY RUN] Would connect to the database and execute migration.up().",
    );
    return;
  }

  const confirmed = await promptForConfirmation("Press Y + Enter to continue");
  if (!confirmed) {
    console.log("Migration cancelled.");
    return;
  }

  if (environment === "prod") {
    const prodConfirmed = await promptForConfirmation(
      "This will modify the production database. Press Y + Enter to continue",
    );
    if (!prodConfirmed) {
      console.log("Migration cancelled.");
      return;
    }
  }

  process.env.MONGO_URI = mongoUri;
  process.env.MONGODB_URI = mongoUri;

  const { connectToDatabase } = await import("@/lib/mongoose");

  console.log("Connecting to MongoDB...");
  await connectToDatabase();

  console.log("Executing migration...");
  try {
    await migrationModule.up();
  } catch (error) {
    if (error instanceof Error) {
      error.message = `Migration ${filename} failed: ${error.message}`;
      throw error;
    }
    throw new Error(`Migration ${filename} failed: ${String(error)}`);
  }

  console.log(`Migration ${filename} completed successfully`);
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

  if (!parsed.filename) {
    usage();
    process.exit(1);
  }

  await runMigration({
    filename: parsed.filename,
    environment: parsed.environment,
    dryRun: parsed.dryRun,
  });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
