
import type { UnifiedBill } from "@/utils/billConverters";
import { TENETS } from "@/prompt/summary-and-vote-prompt";
import { Markdown } from '../Markdown/markdown';
import { Judgement } from "../Judgement/judgement.component";

interface BillAnalysisProps {
  bill: UnifiedBill;
}

function getAlignmentColor(alignment: "aligns" | "conflicts" | "neutral"): string {
  switch (alignment) {
    case "aligns":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "conflicts":
      return "text-rose-700 bg-rose-50 border-rose-200";
    case "neutral":
      return "text-slate-700 bg-slate-50 border-slate-200";
    default:
      return "text-slate-700 bg-slate-50 border-slate-200";
  }
}

function getAlignmentIcon(alignment: "aligns" | "conflicts" | "neutral"): string {
  switch (alignment) {
    case "aligns":
      return "✓";
    case "conflicts":
      return "✗";
    case "neutral":
      return "—";
    default:
      return "—";
  }
}



export function BillAnalysis({ bill }: BillAnalysisProps) {
  if (!bill.tenet_evaluations || bill.tenet_evaluations.length === 0) {
    return null;
  }



  return (
    <div className="space-y-6 relative w-full h-full">
      {/* Final Judgment */}
      {bill.final_judgment && (
        <article className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5   top-0 right-0">
          <div className="flex items-start  justify-between  mb-6 gap-4">
            <h2 className="font-semibold mb-0">Our Assessment</h2>
            {/* <VoteBadge vote={bill.final_judgment} size="lg" /> */}
            <Judgement judgement={bill.final_judgment} />
          </div>
          {bill.rationale && (
            <div className="mt-3 text-sm text-[var(--muted)] leading-6 prose prose-sm max-w-none prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted)] prose-strong:text-[var(--foreground)] prose-ul:text-[var(--muted)] prose-ol:text-[var(--muted)] prose-li:text-[var(--muted)]">
              <Markdown>{bill.rationale}</Markdown>
            </div>
          )}
        </article>
      )}

      {/* Tenet Evaluations */}
      <article className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5">
        <h2 className="font-semibold mb-4">Tenet Analysis</h2>
        <div className="space-y-4">
          {bill.tenet_evaluations.map((tenet) => (
            <div key={tenet.id} className="border-l-4 border-slate-200 pl-4">
              <div className="flex items-start gap-3">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getAlignmentColor(tenet.alignment)}`}>
                  {getAlignmentIcon(tenet.alignment)}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="  font-medium text-[var(--foreground)] mb-1">
                    {TENETS?.[tenet.id as keyof typeof TENETS] || "Unknown"}
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-5">{tenet.explanation}</p>

                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Steel Man Argument */}
      {bill.steel_man && (
        <article className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5">
          <h2 className="font-semibold mb-3">Steel Man Argument</h2>
          <p className="text-xs text-[var(--muted)] mb-3 italic">
            The strongest possible case for how this bill could benefit Canada's prosperity:
          </p>
          <Markdown>{bill.steel_man}</Markdown>
        </article>
      )}

    </div>
  );
}
