import { ImageResponse } from "next/og";
import { getUnifiedBillById } from "@/server/get-unified-bill-by-id";
import { QuestionOgCard } from "@/components/OpenGraph/QuestionOgCard";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function QuestionOpengraphImage({ params }: { params: Promise<{ id: string; index: string }> }) {
  const { id, index } = await params;
  const bill = await getUnifiedBillById(id);
  const idx = Number.parseInt(index, 10);
  const question = bill?.question_period_questions?.[idx - 1]?.question || "";

  return new ImageResponse(
    (
      <QuestionOgCard
        bill={{
          billId: bill?.billId || "",
          title: bill?.title || "",
          short_title: bill?.short_title,
          final_judgment: bill?.final_judgment,
          isSocialIssue: bill?.isSocialIssue || false,
          question,
          index: idx,
          fallbackId: id,
        }}
      />
    ),
    {
      ...size,
    }
  );
}


