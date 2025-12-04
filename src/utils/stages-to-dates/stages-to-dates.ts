import { BillStage, BillSummary } from "@/app/types";

type BillStageDates = {
  firstIntroduced: Date | null;
  lastUpdated: Date | null;
};

export function getBillStageDates(stages?: BillStage[] | null): BillStageDates {
  if (!stages || stages.length === 0) {
    return { firstIntroduced: null, lastUpdated: null };
  }

  const stagesWithTimestamps = stages
    .map((stage) => ({
      ...stage,
      timestamp: new Date(stage.date).getTime(),
    }))
    .filter((stage) => Number.isFinite(stage.timestamp));

  if (stagesWithTimestamps.length === 0) {
    return { firstIntroduced: null, lastUpdated: null };
  }

  stagesWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);

  const firstIntroduced = new Date(stagesWithTimestamps[0].timestamp);
  const lastUpdated = new Date(
    stagesWithTimestamps[stagesWithTimestamps.length - 1].timestamp,
  );

  return { firstIntroduced, lastUpdated };
}

export function getBillStages(bill?: {
  billStages?: BillStage[];
  stages?: BillStage[];
}): BillStage[] {
  if (!bill) return [];
  return bill.billStages ?? bill.stages ?? [];
}

export function getBillMostRecentDate(bill?: {
  billStages?: BillStage[];
  stages?: BillStage[];
  lastUpdatedOn?: string;
  introducedOn?: string;
}): Date | null {
  if (!bill) return null;
  const stages = getBillStages(bill);
  const stageDate = getBillStageDates(stages).lastUpdated;
  if (stageDate) return stageDate;

  const parseDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  return parseDate(bill.lastUpdatedOn) ?? parseDate(bill.introducedOn);
}

/**
 * Sort bills by their most recent known date (stages, lastUpdatedOn, introducedOn).
 * Falls back to billID for deterministic ordering when dates are equal/missing.
 */
export function sortBillsByMostRecent(a: BillSummary, b: BillSummary): number {
  const aDate = getBillMostRecentDate(a)?.getTime() ?? 0;
  const bDate = getBillMostRecentDate(b)?.getTime() ?? 0;
  if (aDate !== bDate) return bDate - aDate;
  return a.billID.localeCompare(b.billID);
}
