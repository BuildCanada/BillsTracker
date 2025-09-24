import Link from "next/link";
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";
import { getBillFromCivicsProjectApi, onBillNotInDatabase } from "@/services/billApi";
import { fromBuildCanadaDbBill, fromCivicsProjectApiBill, type UnifiedBill } from "@/utils/billConverters";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { env } from "@/env";
import { BillHeader, BillSummary, BillMetadata, BillAnalysis, BillContact } from "@/components/BillDetail";
import { BillQuestions } from "@/components/BillDetail/BillQuestions";
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BillTenets } from "@/components/BillDetail/BillTenets";
import { JudgementValue } from "@/components/Judgement/judgement.component";
import { buildAbsoluteUrl, buildRelativePath } from "@/utils/basePath";
import { BUILD_CANADA_TWITTER_HANDLE, BUILD_CANADA_URL } from "@/consts/general";
import { BillShare } from "@/components/BillDetail/BillShare";

// Cache individual bill pages for 2 minutes
export const revalidate = 120;

interface Params {
  params: Promise<any>;
}

export default async function BillDetail({ params }: Params) {
  const { id } = await params;



  const session = await getServerSession(authOptions);
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const proto = (headerList.get("x-forwarded-proto") || "https").split(",")[0];
  const requestOrigin = host ? `${proto}://${host}` : "";
  const origin = env.NEXT_PUBLIC_APP_URL || requestOrigin;
  const shareOrigin = env.NODE_ENV === "production" ? BUILD_CANADA_URL : origin || BUILD_CANADA_URL;
  // Try database first, then fallback to API
  const dbBill = await getBillByIdFromDB(id);
  let unifiedBill: UnifiedBill | null = null;

  if (dbBill) {
    unifiedBill = fromBuildCanadaDbBill(dbBill);
  } else {
    const apiBill = await getBillFromCivicsProjectApi(id);
    if (apiBill) {
      unifiedBill = await fromCivicsProjectApiBill(apiBill);
    }
  }



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

  const isNeutral = unifiedBill.final_judgment === "neutral";
  const isSocialIssue = unifiedBill.isSocialIssue;
  const alignCount = (unifiedBill.tenet_evaluations ?? []).filter((t) => t.alignment === "aligns").length;
  const conflictCount = (unifiedBill.tenet_evaluations ?? []).filter((t) => t.alignment === "conflicts").length;
  const onlySingleIssueVarying = alignCount === 1 || conflictCount === 1;

  const showAnalysis = !isNeutral && !isSocialIssue && !onlySingleIssueVarying;
  const displayJudgement = (onlySingleIssueVarying ? "neutral" : (unifiedBill.final_judgment as JudgementValue)) as JudgementValue;





  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
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
        <BillShare bill={unifiedBill} shareUrl={buildAbsoluteUrl(shareOrigin, id)} variant="compact" />
      </div>
      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_280px] relative">
        <div className="flex gap-4 flex-col">
          <BillSummary bill={unifiedBill} />
          <BillAnalysis bill={unifiedBill} showAnalysis={showAnalysis} displayJudgement={displayJudgement} />
          {showAnalysis && (
            <BillQuestions bill={unifiedBill} />
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
  { params, searchParams }: { params: Promise<any>, searchParams: Promise<{ q?: string }> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  const q = sp?.q;
  const title = id;
  const description = `Bill ${id} analysis and judgement`;
  const h = headers();
  const host = (await h).get("x-forwarded-host") || (await h).get("host") || "";
  const proto = ((await h).get("x-forwarded-proto") || "https").split(",")[0];
  // Ensure we always have a base URL for absolute image URLs (required for Twitter Cards)
  const baseUrl = env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : "http://localhost:3000");
  const pagePath = buildRelativePath(id);
  const pageUrl = `${baseUrl}${pagePath}`;
  const pageUrlWithQuery = q ? `${pageUrl}?q=${encodeURIComponent(q)}` : pageUrl;
  const defaultOgPath = buildRelativePath(id, "opengraph-image");
  const defaultOg = `${baseUrl}${defaultOgPath}`;
  const questionsOgPath = q ? buildRelativePath(id, "q", encodeURIComponent(q), "opengraph-image") : undefined;
  const questionsOg = questionsOgPath ? `${baseUrl}${questionsOgPath}` : undefined;
  const ogImageUrl = questionsOg || defaultOg;

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
      "twitter:image:alt": `Analysis card for Bill ${title}`,
      "twitter:creator": BUILD_CANADA_TWITTER_HANDLE,
      "twitter:site": BUILD_CANADA_TWITTER_HANDLE,
      "twitter:url": pageUrlWithQuery,
    },
  };
}
