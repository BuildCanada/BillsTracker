#!/usr/bin/env tsx

/**
 * Database Sync Script
 *
 * Manage MongoDB dumps and restores for both dev and prod databases.
 *
 * Available Actions:
 *
 * 1. Dump entire local database
 *    tsx src/scripts/sync-db.ts dump --from dev
 *
 * 2. Dump entire production database
 *    tsx src/scripts/sync-db.ts dump --from prod
 *
 * 3. Dump single collection from local
 *    tsx src/scripts/sync-db.ts dump --from dev --collection users
 *
 * 4. Dump single collection from production
 *    tsx src/scripts/sync-db.ts dump --from prod --collection bills
 *
 * 5. Replace entire local database with a dump
 *    tsx src/scripts/sync-db.ts restore --dump db-backups/dev/2025-10-12_14-30-00 --to dev
 *
 * 6. Replace entire production database with a dump
 *    tsx src/scripts/sync-db.ts restore --dump db-backups/dev/2025-10-12_14-30-00 --to prod
 *
 * 7. Replace single collection on local from a dump
 *    tsx src/scripts/sync-db.ts restore --dump db-backups/dev/2025-10-12_14-30-00 --to dev --collection users
 *
 * 8. Replace single collection on production from a dump
 *    tsx src/scripts/sync-db.ts restore --dump db-backups/prod/2025-10-12_14-30-00 --to prod --collection bills
 *
 * Global Options:
 *   --dry-run    Preview actions without executing (available for all commands)
 *
 * Example with dry-run:
 *   tsx src/scripts/sync-db.ts --dry-run restore --dump db-backups/dev/2025-10-12_14-30-00 --to prod
 *
 * Notes:
 * - All actions require confirmation before executing
 * - Production writes require an additional confirmation
 * - Dumps are stored in db-backups/<source>/<timestamp>/
 */

import dotenv from "dotenv";
import path from "node:path";

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { spawnSync } from "node:child_process";
import { mkdir, access, readdir } from "node:fs/promises";
import { Environment, getMongoUri, promptForConfirmation } from "./utils";

const DB_BACKUPS_ROOT = path.join(process.cwd(), "db-backups");

interface ParsedArgs {
  dryRun: boolean;
  command: "dump" | "restore" | null;
  from?: Environment;
  to?: Environment;
  dumpPath?: string;
  collection?: string;
  dbName?: string;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const parsed: ParsedArgs = {
    dryRun: false,
    command: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "dump") {
      parsed.command = "dump";
    } else if (arg === "restore") {
      parsed.command = "restore";
    } else if (arg === "--from") {
      const value = args[++i];
      if (value !== "dev" && value !== "prod") {
        throw new Error(
          `Invalid --from value: ${value}. Must be 'dev' or 'prod'.`,
        );
      }
      parsed.from = value;
    } else if (arg === "--to") {
      const value = args[++i];
      if (value !== "dev" && value !== "prod") {
        throw new Error(
          `Invalid --to value: ${value}. Must be 'dev' or 'prod'.`,
        );
      }
      parsed.to = value;
    } else if (arg === "--dump") {
      parsed.dumpPath = args[++i];
      if (!parsed.dumpPath) {
        throw new Error("--dump requires a path argument");
      }
    } else if (arg === "--collection") {
      parsed.collection = args[++i];
      if (!parsed.collection) {
        throw new Error("--collection requires a name argument");
      }
    } else if (arg === "--db" || arg === "--database") {
      parsed.dbName = args[++i];
      if (!parsed.dbName) {
        throw new Error("--db/--database requires a name argument");
      }
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

type MongooseModule = typeof import("@/lib/mongoose");

let mongooseModulePromise: Promise<MongooseModule> | null = null;

async function loadDefaultDatabaseName(): Promise<string | null> {
  if (!mongooseModulePromise) {
    mongooseModulePromise = import("@/lib/mongoose");
  }
  const { DATABASE_NAME } = await mongooseModulePromise;
  if (typeof DATABASE_NAME !== "string") {
    return null;
  }
  const trimmed = DATABASE_NAME.trim();
  return trimmed === "" ? null : trimmed;
}

function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

async function ensureDirectoryExists(
  dirPath: string,
  dryRun: boolean,
): Promise<void> {
  if (dryRun) {
    console.log(`[DRY RUN] Would create directory: ${dirPath}`);
    return;
  }

  try {
    await access(dirPath);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
}

async function verifyDirectoryExists(dirPath: string): Promise<void> {
  try {
    await access(dirPath);
  } catch {
    throw new Error(`Dump directory does not exist: ${dirPath}`);
  }
}

async function inferDumpDatabaseName(dumpDir: string): Promise<string | null> {
  try {
    const entries = await readdir(dumpDir, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory());
    if (directories.length === 1) {
      return directories[0]?.name ?? null;
    }
  } catch {
    // ignore; handled by caller
  }
  return null;
}

function extractDatabaseNameFromUri(uri: string): string | null {
  const schemeSeparator = uri.indexOf("://");
  if (schemeSeparator === -1) {
    return null;
  }
  const pathStart = uri.indexOf("/", schemeSeparator + 3);
  if (pathStart === -1) {
    return null;
  }
  const path = uri.slice(pathStart + 1).split("?")[0];
  if (!path || path.includes("@") || path.includes(",")) {
    return null;
  }
  return path;
}

function describeDumpAction(from: Environment, collection?: string): string {
  if (collection) {
    return `Dump collection '${collection}' from ${from} database`;
  }
  return `Dump entire ${from} database`;
}

function describeRestoreAction(to: Environment, collection?: string): string {
  if (collection) {
    return `Replace collection '${collection}' on ${to} database`;
  }
  return `Replace entire ${to} database`;
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
    `Dump path must be within ${baseDir}. Received: ${candidate}`,
  );
}

function resolveDumpDirectoryPath(dumpPath: string): string {
  const normalizedInput = path.normalize(dumpPath);

  if (path.isAbsolute(normalizedInput)) {
    return ensurePathWithinBase(DB_BACKUPS_ROOT, normalizedInput);
  }

  const segments = normalizedInput.split(path.sep).filter((segment) => segment);
  if (segments[0] === "db-backups") {
    segments.shift();
  }

  const resolved = path.resolve(DB_BACKUPS_ROOT, ...segments);
  return ensurePathWithinBase(DB_BACKUPS_ROOT, resolved);
}

function resolveDatabaseName({
  uri,
  providedDbName,
  envDbName,
  context,
}: {
  uri: string;
  providedDbName?: string;
  envDbName?: string | null;
  context: string;
}): string {
  if (providedDbName && providedDbName.trim() !== "") {
    return providedDbName.trim();
  }

  const dbFromUri = extractDatabaseNameFromUri(uri);
  if (dbFromUri) {
    return dbFromUri;
  }

  if (envDbName && envDbName.trim() !== "") {
    return envDbName.trim();
  }

  throw new Error(
    `Unable to determine database name for ${context}. Include the database in the connection string, export it via DATABASE_NAME in src/lib/mongoose.ts, or provide it with --db.`,
  );
}

async function dumpDatabase(
  from: Environment,
  collection: string | undefined,
  dryRun: boolean,
  dbNameOverride?: string,
): Promise<void> {
  const mongoUri = await getMongoUri(from);

  // Show action description
  const action = describeDumpAction(from, collection);
  console.log(`\nAction: ${action}`);
  console.log(`Source: ${from}`);
  if (collection) {
    console.log(`Collection: ${collection}`);
  }
  console.log("");

  // First confirmation: what is about to happen
  const confirmed = await promptForConfirmation("Press Y + Enter to continue");
  if (!confirmed) {
    console.log("Operation cancelled.");
    process.exit(0);
  }

  const timestamp = formatTimestamp();
  const backupDir = path.join(DB_BACKUPS_ROOT, from, timestamp);

  console.log(`Dumping to: ${backupDir}`);

  await ensureDirectoryExists(backupDir, dryRun);

  const command = "mongodump";
  const args = ["--uri", mongoUri, "--out", backupDir];

  if (collection) {
    const envDbName =
      dbNameOverride && dbNameOverride.trim() !== ""
        ? undefined
        : await loadDefaultDatabaseName();
    const dbName = resolveDatabaseName({
      uri: mongoUri,
      providedDbName: dbNameOverride,
      envDbName,
      context: `dumping collection '${collection}' from ${from}`,
    });
    args.push("--db", dbName, "--collection", collection);
  }

  const redactedCommand = `${command} --uri <REDACTED> --out ${backupDir}${collection ? ` --db <db> --collection ${collection}` : ""}`;
  console.log(`Command: ${redactedCommand}`);

  if (dryRun) {
    console.log("[DRY RUN] Would execute mongodump command");
    return;
  }

  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.error) {
    throw new Error(`Failed to execute mongodump: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`mongodump exited with code ${result.status}`);
  }

  console.log(`Successfully dumped to: ${backupDir}`);
}

async function restoreDatabase(
  dumpPath: string,
  to: Environment,
  collection: string | undefined,
  dryRun: boolean,
  dbNameOverride?: string,
): Promise<void> {
  // Resolve dump path (relative to repo root unless absolute)
  const resolvedPath = resolveDumpDirectoryPath(dumpPath);

  // Verify dump directory exists
  await verifyDirectoryExists(resolvedPath);

  const mongoUri = await getMongoUri(to);

  // Show action description
  const action = describeRestoreAction(to, collection);
  console.log(`\nAction: ${action}`);
  console.log(`Source dump: ${resolvedPath}`);
  console.log(`Target: ${to}`);
  if (collection) {
    console.log(`Collection: ${collection}`);
  }
  console.log("");

  // First confirmation: what is about to happen
  const confirmed = await promptForConfirmation("Press Y + Enter to continue");
  if (!confirmed) {
    console.log("Operation cancelled.");
    process.exit(0);
  }

  // Second confirmation if writing to prod
  if (to === "prod") {
    const prodConfirmed = await promptForConfirmation(
      "This will modify the production DB. Press Y + Enter to continue",
    );
    if (!prodConfirmed) {
      console.log("Operation cancelled.");
      process.exit(0);
    }
  }

  console.log(`Restoring to ${to} database from: ${resolvedPath}`);

  const command = "mongorestore";
  const args = ["--uri", mongoUri, "--drop"];

  if (collection) {
    const dumpDbName = await inferDumpDatabaseName(resolvedPath);
    const envDbName =
      dbNameOverride && dbNameOverride.trim() !== ""
        ? undefined
        : await loadDefaultDatabaseName();
    const dbName = resolveDatabaseName({
      uri: mongoUri,
      providedDbName: dbNameOverride,
      envDbName,
      context: `restoring collection '${collection}' to ${to}`,
    });
    const nestedCollectionPath =
      dumpDbName !== null
        ? path.join(resolvedPath, dumpDbName, `${collection}.bson`)
        : path.join(resolvedPath, dbName, `${collection}.bson`);
    const directCollectionPath = path.join(resolvedPath, `${collection}.bson`);
    const candidatePaths: string[] = [directCollectionPath];
    if (!candidatePaths.includes(nestedCollectionPath)) {
      candidatePaths.push(nestedCollectionPath);
    }

    let collectionPath: string | null = null;
    for (const candidate of candidatePaths) {
      try {
        await access(candidate);
        collectionPath = candidate;
        break;
      } catch {
        // try next candidate
      }
    }

    if (!collectionPath) {
      throw new Error(
        `Collection dump not found. Checked: ${candidatePaths.join(", ")}`,
      );
    }

    args.push("--db", dbName, "--collection", collection, collectionPath);
  } else {
    args.push(resolvedPath);
  }

  const redactedCommand = collection
    ? `${command} --uri <REDACTED> --drop --db <db> --collection ${collection} <path>`
    : `${command} --uri <REDACTED> --drop ${resolvedPath}`;
  console.log(`Command: ${redactedCommand}`);

  if (dryRun) {
    console.log("[DRY RUN] Would execute mongorestore command");
    return;
  }

  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.error) {
    throw new Error(`Failed to execute mongorestore: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`mongorestore exited with code ${result.status}`);
  }

  console.log(`Successfully restored to ${to} database`);
}

async function main() {
  try {
    const args = parseArgs();

    if (!args.command) {
      console.error(
        "Usage: tsx src/scripts/sync-db.ts [--dry-run] <command> <options>",
      );
      console.error("");
      console.error("Commands:");
      console.error(
        "  dump --from <dev|prod> [--collection <name>] [--db <name>]",
      );
      console.error("    Dump database or collection");
      console.error("");
      console.error(
        "  restore --dump <path> --to <dev|prod> [--collection <name>] [--db <name>]",
      );
      console.error("    Restore database or collection");
      console.error("");
      console.error("Global options:");
      console.error("  --dry-run    Log actions without executing");
      console.error("");
      console.error("Examples:");
      console.error("  tsx src/scripts/sync-db.ts dump --from dev");
      console.error(
        "  tsx src/scripts/sync-db.ts dump --from prod --collection users",
      );
      console.error(
        "  tsx src/scripts/sync-db.ts restore --dump db-backups/dev/2025-10-12_14-30-00 --to dev",
      );
      console.error(
        "  tsx src/scripts/sync-db.ts --dry-run restore --dump db-backups/dev/2025-10-12_14-30-00 --to prod",
      );
      process.exit(1);
    }

    if (args.dryRun) {
      console.log("[DRY RUN MODE ENABLED]");
    }

    if (args.command === "dump") {
      if (!args.from) {
        throw new Error("--from <dev|prod> is required for dump command");
      }
      await dumpDatabase(args.from, args.collection, args.dryRun, args.dbName);
    } else if (args.command === "restore") {
      if (!args.dumpPath) {
        throw new Error("--dump <path> is required for restore command");
      }
      if (!args.to) {
        throw new Error("--to <dev|prod> is required for restore command");
      }
      await restoreDatabase(
        args.dumpPath,
        args.to,
        args.collection,
        args.dryRun,
        args.dbName,
      );
    }

    console.log("\nOperation completed successfully");
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    process.exit(1);
  }
}

main();
