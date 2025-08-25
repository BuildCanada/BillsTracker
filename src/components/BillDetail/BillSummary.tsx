import type { UnifiedBill } from "@/utils/billConverters";

interface BillSummaryProps {
  bill: UnifiedBill;
}

export function BillSummary({ bill }: BillSummaryProps) {
  return (
    <article className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5">
      <h2 className="font-semibold mb-2">Summary</h2>
      <p className="text-sm leading-6 text-[var(--muted)]">{bill.summary}</p>
    </article>
  );
}
