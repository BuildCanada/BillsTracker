import { BillSummary } from "./types";
import BillExplorer from "./BillExplorer";
import { getAllBillsFromDB } from "@/server/get-all-bills-from-db";
import { fromBuildCanadaDbBill } from "@/utils/billConverters";
import { getParliament45Header } from "@/components/BillDetail/BillHeader";
import Markdown from "react-markdown";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { env } from "@/env";
import { buildRelativePath } from "@/utils/basePath";
import { BUILD_CANADA_TWITTER_HANDLE, PROJECT_NAME } from "@/consts/general";
import FAQModalTrigger from "./FAQModalTrigger";

const CANADIAN_PARLIAMENT_NUMBER = 45;
type HomeSearchParams = { cache?: string };

function toIsoString(value?: Date | string): string | undefined {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

// Force runtime generation (avoid build-time pre-render) and cache in-memory.
export const dynamic = "auto";
// Next.js requires route segment configs to be literal values (not imported constants)
export const revalidate = 120; // seconds - cache page data

export async function generateMetadata(): Promise<Metadata> {
  const title = "Home";
  const description =
    "Understand Canadian federal bills with builder-first analysis.";
  const h = headers();
  const headerList = await h;
  const host =
    headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const proto = (headerList.get("x-forwarded-proto") || "https").split(",")[0];
  const baseUrl =
    env.NEXT_PUBLIC_APP_URL ||
    (host ? `${proto}://${host}` : "http://localhost:3000");
  const pagePath = buildRelativePath();
  const pageUrl = `${baseUrl}${pagePath}`;
  const ogPath = buildRelativePath("opengraph-image");
  const ogImageUrl = `${baseUrl}${ogPath}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: PROJECT_NAME,
      description,
      url: pageUrl,
      siteName: PROJECT_NAME,
      type: "website",
      images: [
        { url: ogImageUrl, width: 1200, height: 630, alt: PROJECT_NAME },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: PROJECT_NAME,
      description,
      creator: BUILD_CANADA_TWITTER_HANDLE,
      site: BUILD_CANADA_TWITTER_HANDLE,
      images: [ogImageUrl],
    },
    other: {
      "twitter:card": "summary_large_image",
      "twitter:title": PROJECT_NAME,
      "twitter:description": description,
      "twitter:image": ogImageUrl,
      "twitter:image:alt": PROJECT_NAME,
      "twitter:creator": BUILD_CANADA_TWITTER_HANDLE,
      "twitter:site": BUILD_CANADA_TWITTER_HANDLE,
      "twitter:url": pageUrl,
    },
  };
}

const shouldUseLocalCache = process.env.NODE_ENV === "production";
let mergedBillsCache: { data: BillSummary[]; expiresAt: number } | null = null;

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

async function getMergedBills(): Promise<BillSummary[]> {
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

async function getMergedBillsCached(): Promise<BillSummary[]> {
  if (!shouldUseLocalCache) {
    // Avoid stale data while iterating locally; always hit the backing store.
    mergedBillsCache = null;
    return getMergedBills();
  }

  const now = Date.now();
  const ttlMs = 300 * 1000; // 5 minutes
  if (mergedBillsCache && mergedBillsCache.expiresAt > now) {
    return mergedBillsCache.data;
  }
  const data = await getMergedBills();
  mergedBillsCache = { data, expiresAt: now + ttlMs };
  return data;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<HomeSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (resolvedSearchParams?.cache === "clear") {
    mergedBillsCache = null; // Allow manual cache busting with ?cache=clear
  }
  const bills = await getMergedBillsCached();
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1120px] px-6 py-8  gap-8">
        <main>
          <header className="flex items-center justify-between pb-4 border-b border-[var(--panel-border)] mb-4">
            <h1 className="text-[24px] font-semibold">
              45th Canadian Federal Parliament
            </h1>
            <FAQModalTrigger />
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
