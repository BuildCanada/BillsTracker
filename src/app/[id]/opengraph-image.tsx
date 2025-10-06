import { ImageResponse } from "next/og";
import { getUnifiedBillById } from "@/server/get-unified-bill-by-id";
import { BillOgCard } from "@/components/OpenGraph/BillOgCard";
import { PROJECT_NAME } from "@/consts/general";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Cache for 1 hour to improve performance for social media crawlers
export const revalidate = 3600;

async function loadGoogleFont(font: string, weight: number, text: string) {
  const params = new URLSearchParams({
    family: `${font}:wght@${weight}`,
    text,
  });
  const cssUrl = `https://fonts.googleapis.com/css2?${params.toString()}`;
  const css = await (await fetch(cssUrl)).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype|woff2)'\)/,
  );
  if (resource) {
    const res = await fetch(resource[1]);
    if (res.status === 200) {
      return await res.arrayBuffer();
    }
  }
  throw new Error("failed to load font data");
}

export default async function OpengraphImage({
  params,
}: {
  params: { id: string };
}) {
  const bill = await getUnifiedBillById(params.id);
  const status = (bill?.final_judgment || "abstain").toLowerCase();
  const voteText =
    status === "yes" ? "Vote: Yes" : status === "no" ? "Vote: No" : "Vote: Abstain";
  const textForFont = `${bill?.short_title || bill?.title || params.id} ${voteText} ${PROJECT_NAME} Build Canada Policy Tracker Powered by The Civics Project`;
  let interRegular: ArrayBuffer | undefined;
  let interBold: ArrayBuffer | undefined;
  try {
    interRegular = await loadGoogleFont("Inter", 400, textForFont);
    interBold = await loadGoogleFont("Inter", 700, textForFont);
  } catch (_e) {
    // Fallback to system fonts if remote font fetch fails in production
    interRegular = undefined;
    interBold = undefined;
  }

  return new ImageResponse(
    <BillOgCard
      bill={{
        billId: bill?.billId || "",
        title: bill?.title || "",
        short_title: bill?.short_title,
        summary: bill?.summary || "",
        final_judgment: bill?.final_judgment,
        rationale: bill?.rationale,
        genres: bill?.genres,
        fallbackId: params.id,
      }}
    />,
    {
      ...size,
      fonts:
        interRegular && interBold
          ? [
              {
                name: "Inter",
                data: interRegular,
                weight: 400,
                style: "normal",
              },
              { name: "Inter", data: interBold, weight: 700, style: "normal" },
            ]
          : undefined,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}
