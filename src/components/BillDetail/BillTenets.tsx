import { UnifiedBill } from "@/utils/billConverters";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { TENETS_LIST, getTenetTitle } from "@/utils/constants";
import { getAlignmentColor, getAlignmentIcon } from "./BillAnalysis";

export function BillTenets({ bill }: { bill: UnifiedBill }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Principles Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {TENETS_LIST.map(({ id }) => {
          const ev = (bill.tenet_evaluations ?? []).find((t) => t.id === id);
          const title = getTenetTitle(id) || ev?.title || `Tenet #${id}`;
          const alignment = ev?.alignment ?? "neutral";
          const explanation = ev?.explanation ?? "No evaluation provided.";
          return (
            <div key={id} className="border-l-4 border-slate-200 pl-4">
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getAlignmentColor(alignment)}`}
                >
                  {getAlignmentIcon(alignment)}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--foreground)] mb-1">
                    {title}
                  </h3>
                  <p className="text-sm leading-5 text-[var(--muted-foreground)]">
                    {explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
