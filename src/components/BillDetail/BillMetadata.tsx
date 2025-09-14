import type { UnifiedBill } from "@/utils/billConverters";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface BillMetadataProps {
  bill: UnifiedBill;
}

const DataPoint = ({ label, value }: { label: string, value: string }) => {
  return (
    <div className="flex text-sm items-start justify-between py-1">
      <span className="">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
};

export function BillMetadata({ bill }: BillMetadataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <a
            href={`https://www.parl.ca/LegisInfo/en/bill/45-1/${bill.billId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline text-["
          >
            {bill.billId}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

      </CardContent>
    </Card>
  );
}
