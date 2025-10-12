#!/usr/bin/env tsx

/**
 * Database Migration Runner
 *
 * Run or preview migrations against the dev or production MongoDB databases.
 *
 * Available Actions:
 *
 * 1. Run a migration against the dev database (default)
 *    tsx src/scripts/migrate.ts src/migrations/1.ts
 *
 * 2. Explicitly target dev
 *    tsx src/scripts/migrate.ts src/migrations/2-add-indexes.ts --env dev
 *
 * 3. Run a migration against production (requires confirmation)
 *    tsx src/scripts/migrate.ts src/migrations/3-new-field.ts --env prod
 *
 * 4. Preview without executing
 *    tsx src/scripts/migrate.ts src/migrations/3-new-field.ts --env prod --dry-run
 *
 * Global Options:
 *   --env <dev|prod>   Target environment (default: dev)
 *   --dry-run          Log actions without connecting or mutating data
 *
 * Notes:
 * - Run this script from the repository root so paths resolve correctly.
 * - Supply a path inside src/migrations (absolute or repo-relative like src/migrations/1.ts).
 * - Each migration module must export an async `up` function.
 * - Production targets prompt for a second confirmation before executing.
 */

import dotenv from "dotenv";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  Environment,
  getMongoUri,
  promptForConfirmation,
  redactMongoUri,
} from "./utils";

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const MIGRATIONS_ROOT = path.join(process.cwd(), "src/migrations");

interface ParsedArgs {
  migrationInputPath: string | null;
  environment: Environment;
  dryRun: boolean;
}

function defaultParsedArgs(): ParsedArgs {
  return {
    migrationInputPath: null,
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

    if (!arg.startsWith("-") && parsed.migrationInputPath === null) {
      parsed.migrationInputPath = arg;
      continue;
    }

    if (!arg.startsWith("-") && parsed.migrationInputPath !== null) {
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
    "Usage: tsx src/scripts/migrate.ts <path-to-migration> [--env <dev|prod>] [--dry-run]",
  );
  console.error("Examples:");
  console.error("  tsx src/scripts/migrate.ts src/migrations/1.ts");
  console.error("  tsx src/scripts/migrate.ts src/migrations/1.ts --env prod");
  console.error(
    "  tsx src/scripts/migrate.ts src/migrations/1.ts --env prod --dry-run",
  );
}

function ensurePathWithinBase(baseDir: string, candidate: string): string {
  const relative = path.relative(baseDir, candidate);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    return candidate;
  }
  throw new Error(
    `Migration path must be within ${baseDir}. Received: ${candidate}`,
  );
}

function resolveMigrationPath(input: string): {
  absolutePath: string;
  displayPath: string;
} {
  const normalizedInput = path.normalize(input);

  let candidateAbsolute: string;
  if (path.isAbsolute(normalizedInput)) {
    candidateAbsolute = normalizedInput;
  } else if (normalizedInput.startsWith(`src${path.sep}`)) {
    candidateAbsolute = path.resolve(process.cwd(), normalizedInput);
  } else {
    candidateAbsolute = path.join(MIGRATIONS_ROOT, normalizedInput);
  }

  const migrationPath = ensurePathWithinBase(
    MIGRATIONS_ROOT,
    candidateAbsolute,
  );
  const displayPath = path.relative(process.cwd(), migrationPath);
  return {
    absolutePath: migrationPath,
    displayPath: displayPath || normalizedInput,
  };
}

async function loadMigrationModule(absolutePath: string, displayPath: string) {
  try {
    const migration = await import(pathToFileURL(absolutePath).href);
    return migration as { up?: () => unknown };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load migration ${displayPath}: ${message}`);
  }
}

async function runMigration({
  migrationInputPath,
  environment,
  dryRun,
}: {
  migrationInputPath: string;
  environment: Environment;
  dryRun: boolean;
}): Promise<void> {
  const { absolutePath, displayPath } =
    resolveMigrationPath(migrationInputPath);
  const mongoUri = await getMongoUri(environment);
  const redactedUri = redactMongoUri(mongoUri);
  const action = `Run migration '${displayPath}' on ${environment} database`;

  console.log(`\nAction: ${action}`);
  console.log(`Target environment: ${environment}`);
  console.log(`Mongo URI: ${redactedUri}`);
  console.log(`Migration file: ${displayPath}`);
  console.log("");

  process.env.MONGO_URI = mongoUri;
  process.env.MONGODB_URI = mongoUri;

  const migrationModule = await loadMigrationModule(absolutePath, displayPath);
  if (typeof migrationModule.up !== "function") {
    throw new Error(`Migration ${displayPath} must export an 'up' function`);
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

  const { connectToDatabase } = await import("@/lib/mongoose");

  console.log("Connecting to MongoDB...");
  await connectToDatabase();

  console.log("Executing migration...");
  try {
    await migrationModule.up();
  } catch (error) {
    if (error instanceof Error) {
      error.message = `Migration ${displayPath} failed: ${error.message}`;
      throw error;
    }
    throw new Error(`Migration ${displayPath} failed: ${String(error)}`);
  }

  console.log(`Migration ${displayPath} completed successfully`);
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

  if (!parsed.migrationInputPath) {
    usage();
    process.exit(1);
  }

  await runMigration({
    migrationInputPath: parsed.migrationInputPath,
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
