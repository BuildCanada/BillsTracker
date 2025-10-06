/**
 * Migration 1: Update final_judgment from "neutral" to "abstain" for social issue bills
 *
 * This migration updates all bills where isSocialIssue is true and changes their
 * final_judgment from "neutral" to "abstain".
 */

import { Bill } from "@/models/Bill";

export async function up() {
  console.log("Starting migration: Update neutral to abstain for social issues");

  const result = await Bill.updateMany(
    {
      isSocialIssue: true,
    },
    {
      $set: {
        final_judgment: "abstain",
      },
    },
  );

  console.log(`Updated ${result.modifiedCount} bills from neutral to abstain`);
  console.log(`Matched ${result.matchedCount} bills with the criteria`);
}
