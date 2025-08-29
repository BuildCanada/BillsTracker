import type { UnifiedBill } from "@/utils/billConverters";
import { TENETS } from "@/prompt/summary-and-vote-prompt";

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

function getJudgmentColor(judgment: "yes" | "no" | "neutral"): string {
  switch (judgment) {
    case "yes":
      return "text-emerald-700 bg-emerald-100 border-emerald-300";
    case "no":
      return "text-rose-700 bg-rose-100 border-rose-300";
    case "neutral":
      return "text-slate-700 bg-slate-100 border-slate-300";
    default:
      return "text-slate-700 bg-slate-100 border-slate-300";
  }
}

export function BillAnalysis({ bill }: BillAnalysisProps) {
  if (!bill.tenet_evaluations || bill.tenet_evaluations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Final Judgment */}
      {/* Final Judgment */}
      {bill.final_judgment && (
        <article className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5">
          <h2 className="font-semibold mb-3">Our Assessment</h2>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium ${getJudgmentColor(bill.final_judgment)}`}>
            <span className="text-lg">
              {bill.final_judgment === "yes" ? "✓" : bill.final_judgment === "no" ? "✗" : "—"}
            </span>
            <span className="capitalize">
              {bill.final_judgment === "yes" ? "We would vote for this" :
                bill.final_judgment === "no" ? "We wouldn't vote for this" :
                  "Neutral"}
            </span>
          </div>
          {bill.rationale && (
            <p className="mt-3 text-sm text-[var(--muted)] leading-6">{bill.rationale}</p>
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


    </div>
  );
}
