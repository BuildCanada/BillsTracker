import React from "react";
import type { UnifiedBill } from "@/utils/billConverters";
import { PROJECT_NAME } from "@/consts/general";

type BillSubset = Pick<UnifiedBill, "billId" | "title" | "short_title" | "summary" | "final_judgment" | "rationale" | "genres" | "isSocialIssue"> & {
  fallbackId?: string;
};

export function BillOgCard({ bill }: { bill: BillSubset }) {
  const title = bill.short_title || bill.title || bill.fallbackId || "Bill";
  const voteLabel = bill.isSocialIssue ? "Vote: Neutral" : bill.final_judgment === "yes" ? "Vote: Yes" : bill.final_judgment === "no" ? "Vote: No" : "Vote: Neutral";
  const voteBg = bill.isSocialIssue ? "#4b5563" : bill.final_judgment === "yes" ? "#166534" : bill.final_judgment === "no" ? "#b91c1c" : "#4b5563";

  // the first sentence that isn't quoted 
  let summaryText = bill.summary ? (bill.summary.split(".")[0]) : "";
  // if the first character is ' - ' remove it
  if (summaryText.startsWith('- ')) {
    summaryText = summaryText.slice(2);
  }

  const splitProjectTitle = PROJECT_NAME.split(" ");

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
          padding: 24,
          color: "#1f2937",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "#932f2f",
            color: "#ffffff",
            padding: "12px 16px",
            fontWeight: 300,
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.05,
          }}
        >
          {splitProjectTitle.map((title, index) => (
            <div key={index} style={{
              fontWeight: 700, fontSize: 32, fontFamily: "Inter",
            }}>{title}</div>
          ))}
        </div>


        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {summaryText ? (
              <div style={{ maxWidth: 980, fontSize: 26, color: "#334155", lineHeight: 1.35, marginBottom: 24 }}>{summaryText}</div>
            ) : null}
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: voteBg,
                color: "#ffffff",
                padding: "10px 16px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: 0.5,
                alignItems: "center",
                whiteSpace: "nowrap",
                fontFamily: "Inter",
              }}
            >
              {voteLabel}
            </div>
          </div>
        </div>



        {/* content end */}
      </div>

    </div>
  );
}


