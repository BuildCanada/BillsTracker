#!/usr/bin/env tsx

/**
 * Database Migration Script
 *
 * Usage:
 *   tsx src/scripts/migrate.ts <migration-filename>
 *
 * Examples:
 *   tsx src/scripts/migrate.ts 1.ts
 *   tsx src/scripts/migrate.ts 2-add-indexes.ts
 *   npm run migrate -- 1.ts
 */

import dotenv from "dotenv";
import path from "node:path";

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function runMigration(filename: string) {
  console.log(`Running migration: ${filename}`);

  // Dynamic imports to ensure dotenv loads first
  const { connectToDatabase } = await import("@/lib/mongoose");
  const { env } = await import("@/env");

  // Validate MongoDB connection
  const uri = env.MONGO_URI || "";
  const hasValidMongoUri =
    uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");

  if (!hasValidMongoUri) {
    throw new Error("No valid MongoDB URI found in environment");
  }

  // Connect to database
  await connectToDatabase();

  // Import and run the migration
  const migrationPath = path.join(process.cwd(), "src/migrations", filename);
  try {
    const migration = await import(migrationPath);

    if (!migration.up || typeof migration.up !== "function") {
      throw new Error(`Migration ${filename} must export an 'up' function`);
    }

    await migration.up();
    console.log(`Migration ${filename} completed successfully`);
  } catch (error) {
    console.error(`Migration ${filename} failed:`, error);
    throw error;
  }
}

// Get migration filename from command line arguments
const filename = process.argv[2];

if (!filename) {
  console.error("Usage: tsx src/scripts/migrate.ts <migration-filename>");
  console.error("Example: tsx src/scripts/migrate.ts 1.ts");
  process.exit(1);
}

// Run the migration
runMigration(filename)
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
