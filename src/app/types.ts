export type BillStatus =
  | "Introduced"
  | "In Progress"
  | "Passed"
  | "Failed"
  | "Paused";

export type BillStage = {
  stage: string;
  state: string;
  house: string;
  date: string | Date;
};

export interface BillSummary {
  billID: string;
  title: string;
  shortTitle?: string;
  description: string;
  status: BillStatus;
  stage?: string; // Optional: latest legislative stage label if provided by API
  sponsorParty: string;
  sponsorName: string;
  ministry?: string;
  chamber: "House of Commons" | "Senate";
  introducedOn: string; // ISO date
  lastUpdatedOn: string; // ISO date
  impact?: "Low" | "Medium" | "High";
  alignment?: "Economy" | "Health" | "Environment" | "Security" | "Other";
  // Additional fields from MongoDB/analysis
  summary?: string;
  final_judgment?: "yes" | "no" | "abstain";
  rationale?: string;
  needs_more_info?: boolean;
  missing_details?: string[];
  genres?: string[];
  tenet_evaluations?: Array<{
    id?: number;
    title?: string;
    alignment?: "aligns" | "conflicts" | "neutral";
    explanation?: string;
  } | null>;
  parliamentNumber?: number;
  sessionNumber?: number;
  billStages?: BillStage[];
  /** Some sources use `stages`; keep both to smooth over schema differences. */
  stages?: BillStage[];
  isSocialIssue?: boolean;
}
