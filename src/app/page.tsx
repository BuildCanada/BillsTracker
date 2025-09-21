import { BillSummary } from "./types";
import BillExplorer from "./BillExplorer";
import FAQModalTrigger from "./FAQModalTrigger";
import { getAllBillsFromDB } from "@/server/get-all-bills-from-db";
import { fromBuildCanadaDbBill } from "@/utils/billConverters";
import { getParliament45Header } from "@/components/BillDetail/BillHeader";
import Markdown from "react-markdown";
import { env } from "@/env";


const CANADIAN_PARLIAMENT_NUMBER = 45;

// Cache for 5 minutes - Next.js requires a static value
export const revalidate = 300;

async function getApiBills(): Promise<BillSummary[]> {
  try {
    const response = await fetch(`https://api.civicsproject.org/bills/region/canada/${CANADIAN_PARLIAMENT_NUMBER}`, {
      // Cache for 5 minutes in production, no cache in development
      ...(process.env.NODE_ENV === 'production'
        ? { next: { revalidate: 300 } }
        : { cache: 'no-store' }
      ),
      headers: {
        "Content-Type": "application/json",
        Authorization: env.CIVICS_PROJECT_API_KEY ? `Bearer ${env.CIVICS_PROJECT_API_KEY}` : "",

      },
    });
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

async function getMergedBills(): Promise<BillSummary[]> {
  const [apiBills, dbBills] = await Promise.all([
    getApiBills(),
    getAllBillsFromDB()
  ]);


  // Convert DB bills to UnifiedBill format first, then to BillSummary
  const dbBillsAsUnified = dbBills.map(fromBuildCanadaDbBill);

  // Create a map of DB bills by billId for quick lookup
  const dbBillsMap = new Map(dbBillsAsUnified.map(bill => [bill.billId, bill]));

  // Merge API bills with DB data
  const mergedBills: BillSummary[] = apiBills.map(apiBill => {
    const dbBill = dbBillsMap.get(apiBill.billID);


    if (dbBill) {
      // Merge API bill with DB data (DB data takes precedence for analysis fields)
      return {
        ...dbBill,
        ...apiBill,
        shortTitle: dbBill.short_title || apiBill.shortTitle,
        summary: dbBill.summary,
        isSocialIssue: dbBill.isSocialIssue,
        final_judgment: dbBill.final_judgment,
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
    if (!mergedBills.find(bill => bill.billID === billId)) {
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
        chamber: (dbBill.chamber as "House of Commons" | "Senate") || "House of Commons",
        introducedOn: dbBill.introducedOn?.toISOString() || new Date().toISOString(),
        lastUpdatedOn: dbBill.lastUpdatedOn?.toISOString() || new Date().toISOString(),
        summary: dbBill.summary,
        isSocialIssue: dbBill.isSocialIssue,
        final_judgment: dbBill.final_judgment,
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

  console.log(`Merged ${mergedBills.length} bills (${apiBills.length} from API, ${dbBills.length} from DB)`);
  return mergedBills;
}

export default async function Home() {
  const bills = await getMergedBills();
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1120px] px-6 py-8  gap-8">
        <main>
          <header className="flex items-center gap-4 pb-4 border-b border-[var(--panel-border)] mb-4">
            <h1 className="text-[24px] font-semibold">45th Canadian Federal Parliament</h1>
          </header>

          <Markdown>{getParliament45Header()}</Markdown>


          <section className="mt-6">
            <BillExplorer bills={bills} />
          </section>
        </main>
      </div>
    </div>
  );
}
