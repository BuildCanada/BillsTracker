import "server-only";
import { BillSummary } from "@/app/types";
import { getAllBillsFromDB } from "@/server/get-all-bills-from-db";
import { fromBuildCanadaDbBill } from "@/utils/billConverters";
import { env } from "@/env";

const CANADIAN_PARLIAMENT_NUMBER = 45;

function toIsoString(value?: Date | string): string | undefined {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

async function getApiBills(): Promise<BillSummary[]> {
  try {
    const response = await fetch(
      `${env.CIVICS_PROJECT_BASE_URL}/canada/bills/${CANADIAN_PARLIAMENT_NUMBER}`,
      {
        // Cache for 5 minutes in production, no cache in development
        ...(process.env.NODE_ENV === "production"
          ? { next: { revalidate: 300 } }
          : { cache: "no-store" }),
        headers: {
          "Content-Type": "application/json",
          Authorization: env.CIVICS_PROJECT_API_KEY
            ? `Bearer ${env.CIVICS_PROJECT_API_KEY}`
            : "",
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch bills from API");
    }
    const { data } = await response.json();
    return Array.isArray(data) ? (data as BillSummary[]) : (data?.bills ?? []);
  } catch (error) {
    console.error("Error fetching API bills:", error);
    return [];
  }
}

/**
 * Merge bills from the Civics Project API with Build Canada DB analysis.
 * DB analysis fields take precedence; DB-only bills are appended.
 * Shared by the home page and the sitemap so both see the same bill set.
 */
export async function getMergedBills(): Promise<BillSummary[]> {
  const apiBills = await getApiBills();
  const uri = process.env.MONGO_URI || "";
  const hasValidMongoUri =
    uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
  const dbBills = hasValidMongoUri ? await getAllBillsFromDB() : [];

  // Convert DB bills to UnifiedBill format first, then to BillSummary
  const dbBillsAsUnified = dbBills.map(fromBuildCanadaDbBill);

  // Create a map of DB bills by billId for quick lookup
  const dbBillsMap = new Map(
    dbBillsAsUnified.map((bill) => [bill.billId, bill]),
  );

  // Merge API bills with DB data
  const mergedBills: BillSummary[] = apiBills.map((apiBill) => {
    const dbBill = dbBillsMap.get(apiBill.billID);

    if (dbBill) {
      // Merge API bill with DB data (DB data takes precedence for analysis fields)
      return {
        ...dbBill,
        ...apiBill,
        shortTitle: dbBill.short_title || apiBill.shortTitle,
        summary: dbBill.summary,
        isSocialIssue: dbBill.isSocialIssue,
        final_judgment: dbBill.final_judgment as BillSummary["final_judgment"],
        rationale: dbBill.rationale,
        needs_more_info: dbBill.needs_more_info,
        missing_details: dbBill.missing_details,
        genres: dbBill.genres,
        parliamentNumber: dbBill.parliamentNumber,
        sessionNumber: dbBill.sessionNumber,
      };
    }

    // Return API bill as-is if no DB data
    return apiBill;
  });

  // Add any DB-only bills that aren't in the API response
  for (const [billId, dbBill] of dbBillsMap) {
    if (!mergedBills.find((bill) => bill.billID === billId)) {
      // Convert DB bill to BillSummary format
      const billSummary: BillSummary = {
        billID: dbBill.billId,
        title: dbBill.title,
        shortTitle: dbBill.short_title,
        stages: dbBill.stages || [],
        description: dbBill.summary || "",
        status: (dbBill.status as BillSummary["status"]) || "Introduced",
        sponsorParty: dbBill.sponsorParty || "Unknown",
        sponsorName: "Unknown",
        chamber:
          (dbBill.chamber as "House of Commons" | "Senate") ||
          "House of Commons",
        introducedOn:
          toIsoString(dbBill.introducedOn) || new Date().toISOString(),
        lastUpdatedOn:
          toIsoString(dbBill.lastUpdatedOn) || new Date().toISOString(),
        summary: dbBill.summary,
        isSocialIssue: dbBill.isSocialIssue,
        final_judgment: dbBill.final_judgment as BillSummary["final_judgment"],
        rationale: dbBill.rationale,
        needs_more_info: dbBill.needs_more_info,
        missing_details: dbBill.missing_details,
        genres: dbBill.genres,
        parliamentNumber: dbBill.parliamentNumber,
        sessionNumber: dbBill.sessionNumber,
      };
      mergedBills.push(billSummary);
    }
  }

  return mergedBills;
}
