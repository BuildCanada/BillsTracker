import Link from "next/link";
import { getUnifiedBillById } from "@/server/get-unified-bill";
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
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BillTenets } from "@/components/BillDetail/BillTenets";
import { JudgementValue } from "@/components/Judgement/judgement.component";
import { buildAbsoluteUrl, buildRelativePath } from "@/utils/basePath";
import { getCanonicalOrigin, stripMarkdown, truncate } from "@/utils/seo";
import {
  BUILD_CANADA_TWITTER_HANDLE,
  BUILD_CANADA_URL,
} from "@/consts/general";
import { JsonLd } from "@/components/JsonLd";
import { BillShare } from "@/components/BillDetail/BillShare";
import { shouldShowDetermination } from "@/utils/should-show-determination/should-show-determination.util";

// Next.js requires route segment configs to be literal values (not imported constants)
export const revalidate = 120; // seconds - cache individual bill pages

interface Params {
  params: Promise<{ id: string }>;
}

export default async function BillDetail({ params }: Params) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const proto = (headerList.get("x-forwarded-proto") || "https").split(",")[0];
  const requestOrigin = host ? `${proto}://${host}` : "";
  const origin = env.NEXT_PUBLIC_APP_URL || requestOrigin;
  const shareOrigin =
    env.NODE_ENV === "production"
      ? BUILD_CANADA_URL
      : origin || BUILD_CANADA_URL;
  // Try database first, then fallback to API (memoized; shared with generateMetadata)
  const unifiedBill = await getUnifiedBillById(id);

  if (!unifiedBill) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-10">
        <h1 className="text-xl font-semibold">Bill not found</h1>
        <p className="mt-2 text-sm">
          The bill you are looking for does not exist.
        </p>
        <Link className="mt-4 inline-block underline" href="/">
          Back to list
        </Link>
      </div>
    );
  }

  const shouldDisplayDetermination = shouldShowDetermination(
    unifiedBill.final_judgment,
  );
  const judgementValue: JudgementValue = unifiedBill.final_judgment;

  const canonicalOrigin = getCanonicalOrigin();
  const canonicalUrl = buildAbsoluteUrl(canonicalOrigin, id);
  const homeUrl = `${canonicalOrigin}${buildRelativePath()}`;
  const billName = unifiedBill.short_title || unifiedBill.title;
  const legislationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: billName,
    legislationIdentifier: unifiedBill.billId,
    legislationType: "Bill",
    legislationJurisdiction: "Canada",
    description: unifiedBill.summary
      ? truncate(stripMarkdown(unifiedBill.summary), 300)
      : `Bill ${id} analysis and judgement`,
    url: canonicalUrl,
    ...(unifiedBill.introducedOn
      ? {
          legislationDate: new Date(unifiedBill.introducedOn)
            .toISOString()
            .slice(0, 10),
        }
      : {}),
    ...(unifiedBill.sponsorParty
      ? {
          sponsor: {
            "@type": "Organization",
            name: unifiedBill.sponsorParty,
          },
        }
      : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Bills", item: homeUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: unifiedBill.billId,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <JsonLd data={legislationJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="mb-6">
        <Link href="/" className="text-sm underline  mb-6">
          ← Back to bills
        </Link>
        {session?.user && (
          <Link href={`/${id}/edit`} className="ml-4 text-sm underline">
            Edit
          </Link>
        )}
      </div>
      <BillHeader bill={unifiedBill} />

      <Separator />
      <div className="mt-4 md:hidden">
        <BillShare
          bill={unifiedBill}
          shareUrl={buildAbsoluteUrl(shareOrigin, id)}
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
                billUrl={buildAbsoluteUrl(shareOrigin, id)}
              />
            )}

          <BillTenets bill={unifiedBill} />
          <BillContact className="md:hidden" />
        </div>
        <div className="space-y-6">
          <BillMetadata bill={unifiedBill} />
          <BillShare
            bill={unifiedBill}
            shareUrl={buildAbsoluteUrl(shareOrigin, id)}
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

  // Memoized — shares the fetch with the page component for this request.
  const bill = await getUnifiedBillById(id);

  // Don't index "bill not found" pages.
  if (!bill) {
    return {
      title: id,
      description: `Bill ${id} analysis and judgement`,
      robots: { index: false, follow: false },
    };
  }

  const billName = bill.short_title || bill.title;
  const title = billName ? truncate(`${id}: ${billName}`, 70) : id;
  const description = bill.summary
    ? truncate(stripMarkdown(bill.summary), 155)
    : `Bill ${id} analysis and judgement`;
  const keywords =
    bill.genres && bill.genres.length > 0 ? bill.genres : undefined;

  const baseUrl = getCanonicalOrigin();
  const pagePath = buildRelativePath(id);
  const pageUrl = `${baseUrl}${pagePath}`;
  const pageUrlWithQuery = q
    ? `${pageUrl}?q=${encodeURIComponent(q)}`
    : pageUrl;
  const defaultOgPath = buildRelativePath(id, "opengraph-image");
  const defaultOg = `${baseUrl}${defaultOgPath}`;
  const questionsOgPath = q
    ? buildRelativePath(
        id,
        "question",
        encodeURIComponent(q),
        "opengraph-image",
      )
    : undefined;
  const questionsOg = questionsOgPath
    ? `${baseUrl}${questionsOgPath}`
    : undefined;
  const ogImageUrl = questionsOg || defaultOg;

  return {
    title,
    description,
    keywords,
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
  };
}
