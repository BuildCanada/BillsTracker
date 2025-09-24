import Link from "next/link";
import { memo } from "react";
import { BillSummary } from "@/app/types";
import { Judgement } from "./Judgement/judgement.component";
import { DynamicIcon } from "lucide-react/dynamic";
import dayjs from "dayjs";

import { getCategoryIcon } from "@/utils/bill-category-to-icon/bill-category-to-icon.util";
import { getBillStageDates } from "@/utils/stages-to-dates/stages-to-dates";
import { TenetEvaluation } from "@/models/Bill";

interface BillCardProps {
  bill: BillSummary & { tenet_evaluations?: TenetEvaluation[] };
}

function BillCard({ bill }: BillCardProps) {
  const { lastUpdated } = getBillStageDates(bill.stages);
  const dateDisplay = lastUpdated
    ? dayjs(lastUpdated).format("MMM D, YYYY")
    : "N/A";

  const alignCount = (bill.tenet_evaluations ?? []).filter(
    (t) => t.alignment === "aligns",
  ).length;
  const conflictCount = (bill.tenet_evaluations ?? []).filter(
    (t) => t.alignment === "conflicts",
  ).length;
  const onlySingleIssueVarying = alignCount === 1 || conflictCount === 1;

  console.log({ bill, onlySingleIssueVarying });

  return (
    <li className="group rounded-lg border   bg-[var(--panel)] shadow-sm   duration-200 overflow-hidden">
      <Link href={`/${bill.billID}`} className="block">
        <div className="p-5">
          {/* Header Section */}
          <div className="flex items-start md:flex-row flex-col-reverse  justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2"></div>
              <h2 className="text-xl mb-4 font-semibold    max-w-[70%] transition-colors leading-tight">
                {bill.shortTitle ?? bill.title}
              </h2>
            </div>

            {bill.final_judgment && (
              <Judgement
                judgement={bill?.final_judgment}
                isSocialIssue={bill.isSocialIssue}
                onlySingleIssueVarying={onlySingleIssueVarying}
              />
            )}
          </div>

          {/* Description */}
          {bill.description && (
            <p
              className="text-sm text-[var(--muted-foreground)] mb-3 leading-relaxed overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
              }}
            >
              {bill.description}
            </p>
          )}

          {/* Tags Section */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {/* Impact Badge */}
            {bill.impact && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  bill.impact === "High"
                    ? "bg-red-100 text-red-700"
                    : bill.impact === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {bill.impact} Impact
              </span>
            )}
            {(bill.billID === "C-1" || bill.billID === "S-1") && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                Pro Forma Bill
              </span>
            )}

            {/* Genre Tags (limit to 3 visible) */}
            {bill.genres &&
              bill.genres.length > 0 &&
              bill.genres.map((genre, index) => {
                const icon = getCategoryIcon(genre);
                return (
                  icon && (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      <DynamicIcon
                        className="w-4 h-4 mr-1"
                        name={icon as any}
                      />{" "}
                      {genre}
                    </span>
                  )
                );
              })}
          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-4">
              <span className="text-xs text-[var(--foreground)]">
                Bill {bill.billID}
              </span>{" "}
              {bill.sponsorName && <span>by {bill.sponsorName}</span>}
            </div>
            <span className="text-[var(--muted-foreground)]">
              {dateDisplay}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

// Memoize BillCard to prevent unnecessary re-renders when bill data hasn't changed
export default memo(BillCard);
