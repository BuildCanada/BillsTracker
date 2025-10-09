import type { UnifiedBill } from "@/utils/billConverters";
import { Markdown } from "../Markdown/markdown";
import { Judgement, JudgementValue } from "../Judgement/judgement.component";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface BillAnalysisProps {
  bill: UnifiedBill;
  showAnalysis: boolean;
  displayJudgement: {
    value: JudgementValue;
    shouldDisplay: boolean;
  };
}

export function getAlignmentColor(
  alignment: "aligns" | "conflicts" | "neutral",
): string {
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

export function getAlignmentIcon(
  alignment: "aligns" | "conflicts" | "neutral",
): string {
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

export function BillAnalysis({
  bill,
  showAnalysis,
  displayJudgement,
}: BillAnalysisProps) {
  const judgementValue: JudgementValue = displayJudgement.shouldDisplay
    ? displayJudgement.value
    : "abstain";

  if (!showAnalysis) {
    return (
      <Card>
        <CardHeader>
          <div className="flex md:items-center md:justify-between md:flex-row flex-col gap-4 ">
            <CardTitle className="mb-2">Builder Assessment</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <Judgement judgement={judgementValue} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative flex gap-4 flex-col">
      {showAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex md:items-center md:justify-between md:flex-row flex-col gap-4 ">
              <CardTitle className="mb-2">Builder Assessment</CardTitle>
              <div>
                <Judgement judgement={judgementValue} />
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
      )}
    </div>
  );
}
