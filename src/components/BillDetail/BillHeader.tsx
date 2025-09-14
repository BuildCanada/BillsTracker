import type { UnifiedBill } from "@/utils/billConverters";

interface BillHeaderProps {
  bill: UnifiedBill;
}

export function BillHeader({ bill }: BillHeaderProps) {
  return (
    <header className="pb-4">
      <h1 className="  mb-6 text-[48px] leading-14 font-bold">
        {bill.short_title}
      </h1>
      <p className="mt-2 text-sm text-[ w-1/2">
        {bill.title}
      </p>
    </header>
  );
}
