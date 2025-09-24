import type { UnifiedBill } from "@/utils/billConverters";

interface BillHeaderProps {
  bill: UnifiedBill;
}

export function getParliament45Header() {
  const termStart = new Date("2025-05-26T00:00:00-04:00"); // Opening of the 45th Parliament (1st session)
  const today = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const _daysSinceStart = Math.floor(
    (today.getTime() - termStart.getTime()) / msPerDay,
  );
  // const daySinceStartSuffix =

  // const primeMinister = "Mark Carney";        // PM since Mar 14, 2025
  // const oppositionLeader = "Pierre Poilievre"; // Official Opposition Leader since Aug 18, 2025

  // // House of Commons party standings at opening of the 45th Parliament
  // const seats = {
  //   Liberal: 169,
  //   Conservative: 144,
  //   "Bloc Québécois": 22,
  //   NDP: 7,
  //   Green: 1,
  // };

  // // const seatList = Object.entries(seats)
  //   .map(([party, count]) => `${party} ${count}`)
  //   .join(" • ");

  // return `It's is the
  // **${daysSinceStart}**${daySinceStartSuffix}
  // day of the 45th Canadian Parliament began.
  //  `;
}

export function BillHeader({ bill }: BillHeaderProps) {
  return (
    <header className="pb-4">
      <h1 className="mb-6 md:text-[48px] text-[32px] leading-8 md:leading-14 font-bold">
        {bill.short_title}
      </h1>
      <p className="mt-2 text-sm  md:w-1/2">{bill.title}</p>
    </header>
  );
}
