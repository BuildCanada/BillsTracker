import Link from "next/link";

import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { env } from "@/env";
import {
  BillHeader,
  BillSummary,
  BillMetadata,
  BillContact,
} from "@/components/BillDetail";
import { Separator } from "@/components/ui/separator";
import { buildAbsoluteUrl, buildRelativePath } from "@/utils/basePath";
import { BUILD_CANADA_TWITTER_HANDLE } from "@/consts/general";
import { BillShare } from "@/components/BillDetail/BillShare";

// Next.js requires route segment configs to be literal values (not imported constants)
export const revalidate = 120; // seconds - cache individual bill pages

const WOULD_SUPPORT = true;

export default async function BillDetail() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm underline  mb-6">
          ← Back to bills
        </Link>
      </div>
      <BillHeader
        bill={{
          title: "Budget 2025",
          short_title: "Budget 2025",
          billId: "budget-2025",
          status: "passed",
          stages: [],
          summary: "Coming very soon",
          final_judgment: WOULD_SUPPORT ? "yes" : "no",
        }}
      />

      <Separator />
      <div className="mt-4 md:hidden">
        <BillShare
          bill={{
            title: "Budget 2025",
            short_title: "Budget 2025",
            billId: "budget-2025",
            status: "passed",
            stages: [],
            summary: "Coming very soon",
            final_judgment: WOULD_SUPPORT ? "yes" : "no",
          }}
          shareUrl={buildAbsoluteUrl("https://buildcanada.ca", "budget-2025")}
          variant="compact"
        />
      </div>
      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_280px] relative">
        <div className="flex gap-4 flex-col">
          <BillSummary
            bill={{
              summary: "Coming very soon",
              title: "Budget 2025",
              short_title: "Budget 2025",
              billId: "budget-2025",
              status: "passed",
              stages: [],
              final_judgment: WOULD_SUPPORT ? "yes" : "no",
            }}
          />
        </div>
        <div className="space-y-6">
          <BillMetadata
            bill={{
              title: "Budget 2025",
              billId: "Budget 2025",
              stages: [],
              sponsorParty: "Liberal",
              status: "Tabled",
              summary: "Coming very soon",
              final_judgment: WOULD_SUPPORT ? "yes" : "no",
            }}
          />
          <BillShare
            bill={{
              title: "Budget 2025",
              short_title: "Budget 2025",
              billId: "Budget 2025",
              status: "passed",
              stages: [],
              summary: "Coming very soon",
              final_judgment: WOULD_SUPPORT ? "yes" : "no",
            }}
            shareUrl={buildAbsoluteUrl("https://buildcanada.ca", "budget-2025")}
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
  const h = headers();
  const host = (await h).get("x-forwarded-host") || (await h).get("host") || "";
  const proto = ((await h).get("x-forwarded-proto") || "https").split(",")[0];
  // Ensure we always have a base URL for absolute image URLs (required for Twitter Cards)
  const baseUrl =
    env.NEXT_PUBLIC_APP_URL ||
    (host ? `${proto}://${host}` : "http://localhost:3000");
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
