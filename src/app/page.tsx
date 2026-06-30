import { BillSummary } from "./types";
import BillExplorer from "./BillExplorer";
import { getMergedBills } from "@/server/get-merged-bills";
import { getParliament45Header } from "@/components/BillDetail/BillHeader";
import { JsonLd } from "@/components/JsonLd";
import Markdown from "react-markdown";
import type { Metadata } from "next";
import { buildRelativePath } from "@/utils/basePath";
import { getCanonicalOrigin } from "@/utils/seo";
import {
  BUILD_CANADA_TWITTER_HANDLE,
  BUILD_CANADA_URL,
  PROJECT_NAME,
} from "@/consts/general";
import FAQModalTrigger from "./FAQModalTrigger";

type HomeSearchParams = { cache?: string };

// Force runtime generation (avoid build-time pre-render) and cache in-memory.
export const dynamic = "auto";
// Next.js requires route segment configs to be literal values (not imported constants)
export const revalidate = 120; // seconds - cache page data

export async function generateMetadata(): Promise<Metadata> {
  const title = "Home";
  const description =
    "Understand Canadian federal bills with builder-first analysis.";
  const baseUrl = getCanonicalOrigin();
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
  };
}

const shouldUseLocalCache = process.env.NODE_ENV === "production";
let mergedBillsCache: { data: BillSummary[]; expiresAt: number } | null = null;

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
  const homeUrl = `${getCanonicalOrigin()}${buildRelativePath()}`;
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: PROJECT_NAME,
    description:
      "Understand Canadian federal bills with builder-first analysis.",
    url: homeUrl,
    publisher: {
      "@type": "Organization",
      name: "Build Canada",
      url: BUILD_CANADA_URL,
    },
  };
  return (
    <div className="min-h-screen">
      <JsonLd data={websiteJsonLd} />
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
