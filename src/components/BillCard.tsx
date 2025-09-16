import Link from "next/link";
import { BillSummary } from "@/app/types";
import { getPartyColor } from "@/utils/get-party-colors/get-party-colors.util";
import { stageSummarizer, getStageCategory } from "@/utils/stage-summarizer/stage-summarizer.util";
import { Judgement } from "./Judgement/judgement.component";
import { DynamicIcon } from 'lucide-react/dynamic';

import { getCategoryIcon } from "@/utils/bill-category-to-icon/bill-category-to-icon.util";

type StageStyle = { dot: string; chipBg: string; chipText: string };


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
          <div className="flex items-start md:flex-row flex-col-reverse  justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">



              </div>
              <h2 className="text-xl mb-4 font-semibold    max-w-[70%] transition-colors leading-tight">
                {bill.shortTitle ?? bill.title}
              </h2>
            </div>


            {bill.final_judgment && (
              <Judgement judgement={bill?.final_judgment} isSocialIssue={bill.isSocialIssue} />
            )}
          </div>


          {/* Description */}
          {bill.description && (
            <p className="text-sm text-[var(--muted-foreground)] mb-3 leading-relaxed overflow-hidden"
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
            {bill.genres && bill.genres.length > 0 && bill.genres.map((genre, index) => {
              const icon = getCategoryIcon(genre);
              return icon && (
                <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                  <DynamicIcon className="w-4 h-4 mr-1" name={icon as any} /> {genre}
                </span>
              )
            }
            )}

          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-4">
              <span className="text-xs text-[var(--foreground)]">
                Bill {bill.billID}
              </span>              {bill.sponsorName && (
                <span>by {bill.sponsorName}</span>
              )}
            </div>
            <span className="text-[var(--muted-foreground)]">Updated {updatedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
