import { BillSummary } from "@/app/types";

type BillStageDates = {
  firstIntroduced: Date | null;
  lastUpdated: Date | null;
};

export function getBillStageDates(stages: BillSummary['stages']): BillStageDates {
  if (!stages || stages.length === 0) {
    return { firstIntroduced: null, lastUpdated: null };
  }

  const sorted = [...stages].sort((a, b) => {
    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();
    return aDate - bDate;
  });

  const firstIntroduced = new Date(sorted[0].date);
  const lastUpdated = new Date(sorted[sorted.length - 1].date);

  return { firstIntroduced, lastUpdated };
}