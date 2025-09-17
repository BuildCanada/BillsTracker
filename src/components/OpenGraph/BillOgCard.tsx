import React from "react";
import type { UnifiedBill } from "@/utils/billConverters";

type BillSubset = Pick<UnifiedBill, "billId" | "title" | "short_title" | "summary" | "final_judgment" | "rationale" | "genres"> & {
  fallbackId?: string;
};

export function BillOgCard({ bill }: { bill: BillSubset }) {
  const title = bill.short_title || bill.title || bill.fallbackId || "Bill";
  const pillTitle = title.length > 60 ? `${title.slice(0, 60)}…` : title;

  return (
    <div style={{ width: 1200, height: 630, display: "flex", background: "#f5f3ef" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#efe6dd",
          border: "6px solid #e6ded6",
          borderRadius: 28,
          padding: 24,
          color: "#1f2937",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Georgia, Cambria, Times New Roman",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 32,
            right: 32,
            background: "#932f2f",
            color: "#ffffff",
            borderRadius: 12,

            display: "flex",

          }}
        >

          <img src="https://cdn.prod.website-files.com/679d23fc682f2bf860558c9a/679d23fc682f2bf860558cc6_build_canada-wordmark.svg" alt="Build Canada" height={124} />
        </div>

        <div style={{ display: "flex", flex: 1 }}>
          <div
            style={{
              maxWidth: 980,
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -1,
              color: "#0f172a",
              wordBreak: "break-word",
            }}
          >
            {title}
          </div>
        </div>

        {/* <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <img
              src="https://cdn.prod.website-files.com/679d23fc682f2bf860558c9a/679d23fc682f2bf860558cc6_build_canada-wordmark.svg"
              alt="Build Canada"
              height={40}
              style={{ background: "#932f2f", borderRadius: 8, padding: 8 }}
            />
            <div style={{ display: "flex", flexDirection: "column", marginTop: -4 }}>
              <div style={{ fontWeight: 600, fontSize: 18, color: "#111827" }}>Policy Tracker</div>
              <div style={{ marginTop: 2, fontSize: 12, color: "#6b7280" }}>Powered by The Civics Project</div>
            </div>
          </div>
        </div> */}

        <div
          style={{
            position: "absolute",
            left: 32,
            bottom: 24,
            background: "#262626",
            color: "#ffffff",
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 32,
            display: "flex",
          }}
        >
          {pillTitle}
        </div>
      </div>
    </div>
  );
}


