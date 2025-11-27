import Link from "next/link";
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";
import {
  fromBuildCanadaDbBill,
  type UnifiedBill,
} from "@/utils/billConverters";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { env } from "@/env";
import {
  BillHeader,
  BillSummary,
  BillMetadata,
  BillAnalysis,
  BillContact,
} from "@/components/BillDetail";
import { BillQuestions } from "@/components/BillDetail/BillQuestions";
import { BillTenets } from "@/components/BillDetail/BillTenets";
import { Separator } from "@/components/ui/separator";
import { buildAbsoluteUrl, buildRelativePath } from "@/utils/basePath";
import { BUILD_CANADA_TWITTER_HANDLE } from "@/consts/general";
import { BillShare } from "@/components/BillDetail/BillShare";
import { shouldShowDetermination } from "@/utils/should-show-determination/should-show-determination.util";
import { JudgementValue } from "@/components/Judgement/judgement.component";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Next.js requires route segment configs to be literal values (not imported constants)
export const revalidate = 120; // seconds - cache individual bill pages

const BUDGET_BILL_ID = "budget-2025";

export default async function BudgetPage() {
  const session = await getServerSession(authOptions);

  // Try to fetch the budget bill from the database
  const dbBill = await getBillByIdFromDB(BUDGET_BILL_ID);
  let unifiedBill: UnifiedBill | null = null;

  if (dbBill) {
    unifiedBill = fromBuildCanadaDbBill(dbBill);
  }

  // If bill exists in database, show full bill page
  if (unifiedBill) {
    const shouldDisplayDetermination = shouldShowDetermination(
      unifiedBill.final_judgment,
    );
    const judgementValue: JudgementValue = unifiedBill.final_judgment;

    return (
      <div className="mx-auto max-w-[1100px] px-6 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm underline  mb-6">
            ← Back to bills
          </Link>
          {session?.user && (
            <Link
              href={`/${BUDGET_BILL_ID}/edit`}
              className="ml-4 text-sm underline"
            >
              Edit
            </Link>
          )}
        </div>
        <BillHeader bill={unifiedBill} />

        <Separator />
        <div className="mt-4 md:hidden">
          <BillShare
            bill={unifiedBill}
            shareUrl={buildAbsoluteUrl("https://buildcanada.ca", "budget")}
            variant="compact"
          />
        </div>
        <section className="mt-6 grid gap-6 md:grid-cols-[1fr_280px] relative">
          <div className="flex gap-4 flex-col">
            <BillSummary bill={unifiedBill} />
            <BillAnalysis
              bill={unifiedBill}
              showAnalysis={shouldDisplayDetermination}
              displayJudgement={{
                value: judgementValue,
                shouldDisplay: shouldDisplayDetermination,
              }}
            />
            {shouldDisplayDetermination &&
              unifiedBill.question_period_questions &&
              unifiedBill.question_period_questions.length > 0 && (
                <BillQuestions
                  bill={unifiedBill}
                  billUrl={buildAbsoluteUrl("https://buildcanada.ca", "budget")}
                />
              )}

            <BillTenets bill={unifiedBill} />
            <BillContact className="md:hidden" />
          </div>
          <div className="space-y-6">
            <BillMetadata
              bill={{
                ...unifiedBill,
                billId: unifiedBill.title || unifiedBill.billId,
              }}
            />
            <BillShare
              bill={unifiedBill}
              shareUrl={buildAbsoluteUrl("https://buildcanada.ca", "budget")}
              className="hidden md:block"
            />
            <BillContact className="hidden md:block" />
          </div>
        </section>
      </div>
    );
  }

  // If bill doesn't exist yet, show "coming soon" placeholder
  const WOULD_SUPPORT = true;
  const comingSoonBill: UnifiedBill = {
    billId: BUDGET_BILL_ID,
    title: "Budget 2025",
    short_title: "Budget 2025",
    summary: "Coming very soon",
    status: "Tabled",
    stages: [],
    final_judgment: WOULD_SUPPORT ? "yes" : "no",
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm underline  mb-6">
          ← Back to bills
        </Link>
      </div>
      <BillHeader bill={comingSoonBill} />

      <Separator />
      <div className="mt-4 md:hidden">
        <BillShare
          bill={comingSoonBill}
          shareUrl={buildAbsoluteUrl("https://buildcanada.ca", "budget")}
          variant="compact"
        />
      </div>
      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_280px] relative">
        <div className="flex gap-4 flex-col">
          <BillSummary bill={comingSoonBill} />
        </div>
        <div className="space-y-6">
          <BillMetadata
            bill={{
              ...comingSoonBill,
              billId: comingSoonBill.title,
              sponsorParty: "Liberal",
            }}
          />
          <BillShare
            bill={comingSoonBill}
            shareUrl={buildAbsoluteUrl("https://buildcanada.ca", "budget")}
            className="hidden md:block"
          />
          <BillContact className="hidden md:block" />
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(
  {
    params,
    searchParams,
  }: { params: Promise<any>; searchParams: Promise<{ q?: string }> },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  const q = sp?.q;
  const title = "Budget 2025";
  const description = "Budget 2025 analysis and judgement";
  const h = headers();
  const host = (await h).get("x-forwarded-host") || (await h).get("host") || "";
  const proto = ((await h).get("x-forwarded-proto") || "https").split(",")[0];
  // Ensure we always have a base URL for absolute image URLs (required for Twitter Cards)
  const baseUrl =
    env.NEXT_PUBLIC_APP_URL ||
    (host ? `${proto}://${host}` : "http://localhost:3000");
  const pagePath = buildRelativePath(id || "budget");
  const pageUrl = `${baseUrl}${pagePath}`;
  const pageUrlWithQuery = q
    ? `${pageUrl}?q=${encodeURIComponent(q)}`
    : pageUrl;
  const defaultOgPath = buildRelativePath(id || "budget", "opengraph-image");
  const defaultOg = `${baseUrl}${defaultOgPath}`;
  const ogImageUrl = defaultOg;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrlWithQuery,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: BUILD_CANADA_TWITTER_HANDLE,
      site: BUILD_CANADA_TWITTER_HANDLE,
      images: [ogImageUrl],
    },
    other: {
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": ogImageUrl,
      "twitter:image:alt": `Analysis card for ${title}`,
      "twitter:creator": BUILD_CANADA_TWITTER_HANDLE,
      "twitter:site": BUILD_CANADA_TWITTER_HANDLE,
      "twitter:url": pageUrlWithQuery,
    },
  };
}
