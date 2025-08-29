import type { UnifiedBill } from "@/utils/billConverters";

interface BillHeaderProps {
  bill: UnifiedBill;
}

export function BillHeader({ bill }: BillHeaderProps) {
  return (
    <header className="mt-3 pb-4 border-b border-[var(--panel-border)]">

      <h1 className="mt-2 text-[28px] font-semibold">{bill.title}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {bill.sponsorParty && `Sponsored by ${bill.sponsorParty}`}
        {bill.chamber && ` • ${bill.chamber}`}
      </p>
    </header>
  );
}
