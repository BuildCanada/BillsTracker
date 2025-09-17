import { ImageResponse } from "next/og";
import { getUnifiedBillById } from "@/server/get-unified-bill-by-id";
import { BillOgCard } from "@/components/OpenGraph/BillOgCard";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: { id: string } }) {
  const bill = await getUnifiedBillById(params.id);

  return new ImageResponse(
    (
      <BillOgCard bill={{
        billId: bill?.billId || "",
        title: bill?.title || "",
        short_title: bill?.short_title,
        summary: bill?.summary || "",
        final_judgment: bill?.final_judgment,
        rationale: bill?.rationale,
        genres: bill?.genres,
        fallbackId: params.id,
      }} />
    ),
    {
      ...size,
    }
  );
}


