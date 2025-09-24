import { UnifiedBill } from "@/utils/billConverters";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { TENETS } from "@/prompt/summary-and-vote-prompt";
import { getAlignmentColor, getAlignmentIcon } from "./BillAnalysis";

export function BillTenets({ bill }: { bill: UnifiedBill }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Principles Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(bill.tenet_evaluations ?? []).map((tenet) => (
          <div key={tenet.id} className="border-l-4 border-slate-200 pl-4">
            <div className="flex items-start gap-3">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getAlignmentColor(tenet.alignment)}`}
              >
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
  );
}
