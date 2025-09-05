import type { UnifiedBill } from "@/utils/billConverters";

interface BillMetadataProps {
  bill: UnifiedBill;
}

const DataPoint = ({ label, value }: { label: string, value: string }) => {
  return (
    <div className="flex items-start justify-between py-1">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
};

export function BillMetadata({ bill }: BillMetadataProps) {
  return (
    <aside className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5 text-sm">
      <DataPoint label="Party" value={bill.chamber === 'Senate' ? 'Senate' : bill.sponsorParty || 'Unknown'} />
      <DataPoint label="Status" value={bill.status} />
      {bill.introducedOn && (
        <DataPoint label="Introduced" value={bill.introducedOn.toLocaleDateString()} />
      )}
      {bill.lastUpdatedOn && (
        <DataPoint label="Last updated" value={bill.lastUpdatedOn.toLocaleDateString()} />
      )}
      {bill.genres && bill.genres.length > 0 && (
        <DataPoint label="Topics" value={bill.genres.join(", ")} />
      )}
      {bill.parliamentNumber && bill.sessionNumber && (
        <DataPoint label="Parliament" value={`${bill.parliamentNumber}-${bill.sessionNumber}`} />
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
