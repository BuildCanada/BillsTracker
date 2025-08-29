import type { UnifiedBill } from "@/utils/billConverters";

interface BillMetadataProps {
  bill: UnifiedBill;
}

export function BillMetadata({ bill }: BillMetadataProps) {
  return (
    <aside className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5 text-sm">
      <div className="flex items-start justify-between py-1">
        <span className="text-[var(--muted)]">Status</span>
        <span className="font-medium text-right">{bill.status}</span>
      </div>
      {bill.introducedOn && (
        <div className="flex items-start justify-between py-1">
          <span className="text-[var(--muted)] text-right">Introduced</span>
          <span className="font-medium text-right">{bill.introducedOn.toLocaleDateString()}</span>
        </div>
      )}
      {bill.lastUpdatedOn && (
        <div className="flex items-start justify-between py-1">
          <span className="text-[var(--muted)] text-right">Last updated</span>
          <span className="font-medium text-right">{bill.lastUpdatedOn.toLocaleDateString()}</span>
        </div>
      )}
      {bill.genres && bill.genres.length > 0 && (
        <div className="flex items-start justify-between py-1">
          <span className="text-[var(--muted)] text-right">Topics</span>
          <span className="font-medium text-right">{bill.genres.join(", ")}</span>
        </div>
      )}
      {bill.parliamentNumber && bill.sessionNumber && (
        <div className="flex items-start justify-between py-1">
          <span className="text-[var(--muted)] text-right">Parliament</span>
          <span className="font-medium text-right">{bill.parliamentNumber}-{bill.sessionNumber}</span>
        </div>
      )}
      <div className="flex items-start justify-between py-1">
        <span className="text-[var(--muted)] text-right">Bill ID</span>
        <a
          href={`https://www.parl.ca/LegisInfo/en/bill/45-1/${bill.billId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline text-[var(--muted)]"
        >
          <span className="font-medium text-right">{bill.billId}</span>
        </a>
      </div>
    </aside>
  );
}
