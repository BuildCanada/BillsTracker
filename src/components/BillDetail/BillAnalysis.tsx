
import type { UnifiedBill } from "@/utils/billConverters";
import { TENETS } from "@/prompt/summary-and-vote-prompt";
import { Markdown } from '../Markdown/markdown';
import { Judgement, JudgementValue } from "../Judgement/judgement.component";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
    <div className="space-y-6 relative w-full">

      <Card>
        <CardHeader>
          <div className="flex md:items-center md:justify-between md:flex-row flex-col gap-4 ">

            <CardTitle className="mb-2">Our Assessment</CardTitle>
            <div>
              <Judgement isSocialIssue={bill.isSocialIssue} judgement={bill.final_judgment as JudgementValue} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bill.rationale && (
            <div className="text-sm  leading-6 prose prose-sm max-w-none ">
              <Markdown>{bill.rationale}</Markdown>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tenet Analysis</CardTitle>

        </CardHeader>
        <CardContent className="space-y-4">
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
                  <p className="text-sm text-[ leading-5">{tenet.explanation}</p>

                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
