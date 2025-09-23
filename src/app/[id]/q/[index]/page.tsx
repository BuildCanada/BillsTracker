import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { env } from "@/env";
import { getUnifiedBillById } from "@/server/get-unified-bill-by-id";
import Link from "next/link";

export const revalidate = 120;

export default async function QuestionSharePage({ params }: { params: { id: string, index: string } }) {
  const { id, index } = await params;
  const bill = await getUnifiedBillById(id);
  const idx = Number.parseInt(index, 10);
  const question = bill?.question_period_questions?.[idx - 1]?.question || "";
  const title = bill?.short_title || bill?.title || id;

  return (
    <div className="mx-auto max-w-[800px] px-6 py-10">
      <h1 className="text-xl font-semibold mb-2">Question {idx}</h1>
      <p className="text-sm text-muted-foreground mb-4">from {title}</p>
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap">{question}</p>
      </div>
      <div className="mt-6">
        <Link className="underline text-sm" href={`/${id}?q=${idx}#q-${idx}`}>View full bill and discussion →</Link>
      </div>
    </div>
  );
}

export async function generateMetadata(
  { params }: { params: { id: string, index: string } },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id, index } = await params;
  const h = headers();
  const host = (await h).get("x-forwarded-host") || (await h).get("host") || "";
  const proto = ((await h).get("x-forwarded-proto") || "https").split(",")[0];
  const baseUrl = env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : "");
  const pageUrl = baseUrl ? `${baseUrl}/${id}/q/${index}` : `/${id}/q/${index}`;
  const ogImageUrl = baseUrl ? `${baseUrl}/${id}/questions-opengraph-image?index=${encodeURIComponent(index)}` : `/${id}/questions-opengraph-image?index=${encodeURIComponent(index)}`;
  const title = `Question ${index} · ${id}`;
  const description = `Question ${index} from ${id}`;

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


