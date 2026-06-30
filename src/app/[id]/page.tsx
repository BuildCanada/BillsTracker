import Link from "next/link";
import { getUnifiedBillByIdWithApiFallback } from "@/server/get-unified-bill-by-id";
import type { Metadata, ResolvingMetadata } from "next";
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
import { EditBillLink } from "@/components/BillDetail/EditBillLink";
import { BillTenets } from "@/components/BillDetail/BillTenets";
import { JudgementValue } from "@/components/Judgement/judgement.component";
import { buildAbsoluteUrl, buildRelativePath } from "@/utils/basePath";
import {
  BUILD_CANADA_TWITTER_HANDLE,
  BUILD_CANADA_URL,
} from "@/consts/general";
import { BillShare } from "@/components/BillDetail/BillShare";
import { shouldShowDetermination } from "@/utils/should-show-determination/should-show-determination.util";

// Next.js requires route segment configs to be literal values (not imported constants)
export const revalidate = 120; // seconds - cache individual bill pages

interface Params {
  params: Promise<{ id: string }>;
}

export default async function BillDetail({ params }: Params) {
  const { id } = await params;

  const shareOrigin =
    env.NODE_ENV === "production"
      ? BUILD_CANADA_URL
      : env.NEXT_PUBLIC_APP_URL || BUILD_CANADA_URL;
  // Try database first, then fall back to the Civics Project API
  const unifiedBill = await getUnifiedBillByIdWithApiFallback(id);

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

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm underline  mb-6">
          ← Back to bills
        </Link>
        <EditBillLink id={id} />
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
  const title = id;
  const description = `Bill ${id} analysis and judgement`;
  // Ensure we always have a base URL for absolute image URLs (required for Twitter Cards)
  const baseUrl =
    env.NEXT_PUBLIC_APP_URL ||
    (env.NODE_ENV === "production"
      ? BUILD_CANADA_URL
      : "http://localhost:3000");
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
