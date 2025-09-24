import React from "react";
import type { UnifiedBill } from "@/utils/billConverters";

type QuestionSubset = Pick<
  UnifiedBill,
  "billId" | "title" | "short_title" | "final_judgment" | "isSocialIssue"
> & {
  question: string;
  index: number;
  fallbackId?: string;
};

export function QuestionOgCard({ bill }: { bill: QuestionSubset }) {
  const title = bill.short_title || bill.title || bill.fallbackId || "Bill";
  const voteLabel = bill.isSocialIssue
    ? "Vote: Neutral"
    : bill.final_judgment === "yes"
      ? "Vote: Yes"
      : bill.final_judgment === "no"
        ? "Vote: No"
        : "Vote: Neutral";
  const voteBg = bill.isSocialIssue
    ? "#4b5563"
    : bill.final_judgment === "yes"
      ? "#166534"
      : bill.final_judgment === "no"
        ? "#b91c1c"
        : "#4b5563";

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        background: "#f5f3ef",
      }}
    >
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
            display: "flex",
            flexDirection: "column",
            gap: 16,
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: -0.5,
              }}
            >
              Question {bill.index}
            </div>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: voteBg,
                color: "#ffffff",
                padding: "8px 14px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: 0.5,
                alignItems: "center",
                whiteSpace: "nowrap",
                fontFamily: "Inter",
              }}
            >
              {voteLabel}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              flex: 1,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                maxWidth: 1040,
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#0f172a",
                wordBreak: "break-word",
              }}
            >
              {title}
            </div>
            <div
              style={{
                maxWidth: 1040,
                fontSize: 28,
                color: "#334155",
                lineHeight: 1.4,
                marginTop: 12,
                wordBreak: "break-word",
              }}
            >
              {bill.question}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 18, color: "#6b7280" }}>
              Question Period
            </div>
            <div style={{ fontSize: 18, color: "#6b7280" }}>{bill.billId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
