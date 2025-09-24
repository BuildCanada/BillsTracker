import { ImageResponse } from "next/og";
import { getUnifiedBillById } from "@/server/get-unified-bill-by-id";
import { QuestionOgCard } from "@/components/OpenGraph/QuestionOgCard";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Cache for 1 hour to improve performance for social media crawlers
export const revalidate = 3600;

export default async function QuestionsOpengraphImage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { index?: string };
}) {
  const bill = await getUnifiedBillById(params.id);
  const indexParam =
    typeof searchParams?.index === "string"
      ? parseInt(searchParams.index, 10)
      : 1;
  const index = Number.isFinite(indexParam) && indexParam > 0 ? indexParam : 1;
  const question = bill?.question_period_questions?.[index - 1]?.question || "";

  return new ImageResponse(
    <QuestionOgCard
      bill={{
        billId: bill?.billId || "",
        title: bill?.title || "",
        short_title: bill?.short_title,
        final_judgment: bill?.final_judgment,
        isSocialIssue: bill?.isSocialIssue || false,
        question,
        index,
        fallbackId: params.id,
      }}
    />,
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}
