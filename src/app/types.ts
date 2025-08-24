export type BillStatus = "Introduced" | "In Progress" | "Passed" | "Failed" | "Paused";

export interface BillSummary {
  billID: string;
  title: string;
  shortTitle?: string;
  description: string;
  status: BillStatus;
  sponsor: string;
  ministry?: string;
  chamber: "House of Commons" | "Senate";
  introducedOn: string; // ISO date
  lastUpdatedOn: string; // ISO date
  impact?: "Low" | "Medium" | "High";
  alignment?: "Economy" | "Health" | "Environment" | "Security" | "Other";
}


