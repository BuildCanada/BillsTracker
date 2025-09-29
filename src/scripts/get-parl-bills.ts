#!/usr/bin/env tsx

/*
Usage: npm run get-parl-bills -- <parliament-number>
Example: npm run get-parl-bills -- 45

Will copy bill data to the clipboard in CSV format.
*/

import * as dotenv from "dotenv";
import * as path from "node:path";
import { execSync } from "node:child_process";
import type { ApiBillDetail } from "../services/billApi";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

async function fetchBills(parliament: number): Promise<ApiBillDetail[]> {
  const apiKey = process.env.CIVICS_PROJECT_API_KEY;
  if (!apiKey) throw new Error("CIVICS_PROJECT_API_KEY required");

  const response = await fetch(
    `https://api.civicsproject.org/bills/region/canada/${parliament}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed: ${response.status} ${response.statusText}`);
  }

  const { data } = await response.json();
  return (data?.bills || data || []) as ApiBillDetail[];
}

function toCSV(bills: ApiBillDetail[]): string {
  const headers = [
    "BILL_NUMBER",
    "TITLE",
    "FINAL_JUDGEMENT",
    "IS_SOCIAL_ISSUE",
    "RATIONALE",
    "URL",
  ];

  // Deduplicate by billID
  const unique = [
    ...new Map(bills.map((b) => [b.billID?.toUpperCase(), b])).values(),
  ]
    .filter((b) => b.billID)
    .sort((a, b) => (a.billID || "").localeCompare(b.billID || ""));

  const rows = unique.map((bill) => {
    const title = `"${(bill.title || "").replace(/"/g, '""')}"`;
    const url = bill.billID
      ? `https://www.parl.ca/LegisInfo/en/bill/${bill.parliamentNumber || 45}-${bill.sessionNumber || 1}/${bill.billID}`
      : "";
    return [bill.billID, title, "", "", "", url].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

async function main() {
  const parliament = parseInt(process.argv[2], 10);

  if (!process.argv[2] || Number.isNaN(parliament) || parliament < 1) {
    console.error("Usage: npm run get-parl-bills -- <parliament-number>");
    console.error("Example: npm run get-parl-bills -- 45");
    process.exit(1);
  }

  try {
    console.log(`Fetching Parliament ${parliament}...`);
    const bills = await fetchBills(parliament);
    const csv = toCSV(bills);

    execSync("pbcopy", { input: csv });

    const unique = new Set(bills.map((b) => b.billID?.toUpperCase())).size;
    const sessions = [...new Set(bills.map((b) => b.sessionNumber))].sort();

    console.log(`✓ Copied to clipboard`);
    console.log(`  Parliament: ${parliament}`);
    console.log(`  Bills: ${unique} unique (${bills.length} total)`);
    console.log(`  Sessions: ${sessions.join(", ")}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
