import Link from "next/link";
import { BillSummary } from "@/app/types";
import { getPartyColor } from "@/utils/get-party-colors/get-party-colors.util";
import { stageSummarizer, getStageCategory } from "@/utils/stage-summarizer/stage-summarizer.util";
import { Judgement } from "./Judgement/judgement.component";

type StageStyle = { dot: string; chipBg: string; chipText: string };

function getStageStyle(bill: BillSummary): StageStyle {
  const category = getStageCategory(bill.stage || "", bill.status);

  switch (category) {
    case "complete":
      return { dot: "bg-emerald-500", chipBg: "bg-emerald-100", chipText: "text-emerald-700" };
    case "failed":
      return { dot: "bg-rose-500", chipBg: "bg-rose-100", chipText: "text-rose-700" };
    case "active":
      return { dot: "bg-amber-500", chipBg: "bg-amber-100", chipText: "text-amber-700" };
    case "introduced":
      return { dot: "bg-sky-500", chipBg: "bg-sky-100", chipText: "text-sky-700" };
    case "paused":
      return { dot: "bg-slate-400", chipBg: "bg-slate-200", chipText: "text-slate-700" };
    case "pre-introduction":
      return { dot: "bg-gray-400", chipBg: "bg-gray-100", chipText: "text-gray-700" };
    default:
      return { dot: "bg-slate-400", chipBg: "bg-slate-200", chipText: "text-slate-700" };
  }
}

interface BillCardProps {
  bill: BillSummary;
}

export default function BillCard({ bill }: BillCardProps) {
  const updatedAt = new Date(bill.lastUpdatedOn);

  return (
    <li className="group rounded-lg border   bg-[var(--panel)] shadow-sm   duration-200 overflow-hidden">
      <Link href={`/bills/${bill.billID}`} className="block">
        <div className="p-5">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">



              </div>
              <h2 className="text-lg mb-4 font-semibold text-[var(--foreground)]  transition-colors leading-tight">
                {bill.shortTitle ?? bill.title}
              </h2>
            </div>


            {bill.final_judgment && (
              <Judgement judgement={bill?.final_judgment} />
            )}
          </div>


          {/* Description */}
          {bill.description && (
            <p className="text-sm text-[ mb-3 leading-relaxed overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const
              }}>
              {bill.description}
            </p>
          )}

          {/* Tags Section */}
          <div className="flex flex-wrap gap-1.5 mb-4">

            {/* Impact Badge */}
            {bill.impact && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bill.impact === 'High' ? 'bg-red-100 text-red-700' :
                bill.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                {bill.impact} Impact
              </span>
            )}
            {
              (bill.billID === 'C-1' || bill.billID === 'S-1') && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Pro Forma Bill
                </span>
              )
            }

            {/* Genre Tags (limit to 3 visible) */}
            {bill.genres && bill.genres.length > 0 && bill.genres.map((genre, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                {genre}
              </span>
            ))}

          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-between text-xs text-[ pt-2 border-t  ">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-800">
                Bill {bill.billID}
              </span>              {bill.sponsorName && (
                <span>by {bill.sponsorName}</span>
              )}
            </div>
            <span className="text-gray-500">Updated {updatedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
