import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

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

export default async function HomeOpengraphImage() {
  const textForFont = "Builder MP";

  let interRegular: ArrayBuffer | undefined;
  let interBold: ArrayBuffer | undefined;

  try {
    interRegular = await loadGoogleFont("Inter", 400, textForFont);
    interBold = await loadGoogleFont("Inter", 700, textForFont);
  } catch (_e) {
    interRegular = undefined;
    interBold = undefined;
  }

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#8c2f2f",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          width: 320,
          height: 320,
          border: "8px solid #221c1c",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: -1.5,
          lineHeight: 1.05,
          textAlign: "center",
        }}
      >
        <span>Builder</span>
        <span>MP</span>
      </div>
    </div>,
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
