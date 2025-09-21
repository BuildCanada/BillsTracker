import Link from "next/link";
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";
import { getBillFromApi } from "@/services/billApi";
import { fromDbBill, fromApiBill, type UnifiedBill } from "@/utils/billConverters";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { env } from "@/env";
import {
  BillHeader,
  BillSummary,
  BillMetadata,
  BillAnalysis,
} from "@/components/BillDetail";
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "next-auth";

// Cache individual bill pages for 10 minutes
export const revalidate = 600;

interface Params {
  params: Promise<any>;
}

export default async function BillDetail({ params }: Params) {
  const { id } = await params;

  // Try database first, then fallback to API
  const dbBill = await getBillByIdFromDB(id);
  let unifiedBill: UnifiedBill | null = null;

  if (dbBill) {
    unifiedBill = fromDbBill(dbBill);
  } else {
    const apiBill = await getBillFromApi(id);
    if (apiBill) {
      unifiedBill = await fromApiBill(apiBill);
    }
  }

  if (!unifiedBill) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-10">
        <h1 className="text-xl font-semibold">Bill not found</h1>
        <p className="mt-2 text-sm">
          The bill you are looking for does not exist.
        </p>
        <Link className="mt-4 inline-block underline" href="/bills">
          Back to list
        </Link>
      </div>
    );
  }

  const session = { user: null };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="mb-6">

        <Link href="/bills" className="text-sm underline  mb-6">
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
      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_280px] relative">
        <div className="space-y-6">
          <BillSummary bill={unifiedBill} />
          <BillAnalysis bill={unifiedBill} />
          {/* <BillTimeline bill={unifiedBill} /> */}
        </div>
        <div className="space-y-6">
          <BillMetadata bill={unifiedBill} />
        </div>

      </section>
    </div>
  );
}

export async function generateMetadata(
  { params }: Params,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  // Try database first, then fallback to API
  const dbBill = await getBillByIdFromDB(id);
  let unifiedBill: UnifiedBill | null = null;
  if (dbBill) {
    unifiedBill = fromDbBill(dbBill);
  } else {
    const apiBill = await getBillFromApi(id);
    if (apiBill) {
      unifiedBill = await fromApiBill(apiBill);
    }
  }

  const title = unifiedBill?.short_title || unifiedBill?.title || id;
  const description = unifiedBill?.summary || `Bill ${id} analysis and judgement`;
  const h = headers();
  const host = (await h).get("x-forwarded-host") || (await h).get("host") || "";
  const proto = ((await h).get("x-forwarded-proto") || "https").split(",")[0];
  const baseUrl = env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : "");
  const pageUrl = baseUrl ? `${baseUrl}/${id}` : `/${id}`;
  const ogImageUrl = baseUrl ? `${baseUrl}/${id}/opengraph-image` : `/${id}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
