"use client";

import { useMemo, useState } from "react";
import { BillSummary } from "./types";
import { BillCard, Bill } from "@/components/BillExploreCard/BillExploreCard.component";
import { useRouter } from "next/navigation";


interface BillExplorerProps {
  bills: BillSummary[];
}

export default function BillExplorer({ bills }: BillExplorerProps) {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [impact, setImpact] = useState<string>("");
  const [judgment, setJudgment] = useState<string>("");
  const [chamber, setChamber] = useState<string>("");
  const [sponsorParty, setSponsorParty] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("lastUpdated-desc");

  // Transform BillSummary to Bill interface
  const transformBillSummaryToBill = (billSummary: BillSummary): Bill => {
    // Map BillStatus to the expected status format
    const statusMap: Record<string, Bill['status']> = {
      "Introduced": "introduced",
      "In Progress": "committee",
      "Passed": "enacted",
      "Failed": "failed",
      "Paused": "committee"
    };

    // Map party names to expected format
    const partyMap: Record<string, Bill['sponsor']['party']> = {
      "Liberal": "Democrat",
      "Conservative": "Republican",
      "NDP": "Independent",
      "Bloc Québécois": "Independent",
      "Green": "Independent",
      "Senate": "Independent"
    };

    // Calculate progress based on status
    const progressMap: Record<string, number> = {
      "introduced": 20,
      "committee": 50,
      "passed-house": 75,
      "passed-senate": 90,
      "enacted": 100,
      "failed": 0
    };

    const mappedStatus = statusMap[billSummary.status] || "introduced";
    const billOrigin = billSummary.chamber === 'House of Commons' ? (billSummary.sponsorParty || 'Unknown') : 'Senate';
    const mappedParty = partyMap[billOrigin] || "Independent";

    return {
      id: billSummary.billID,
      number: billSummary.billID,
      title: billSummary.shortTitle || billSummary.title,
      summary: billSummary.summary || billSummary.description,
      status: mappedStatus,
      sponsor: {
        name: billSummary.sponsorName || "Unknown",
        party: mappedParty,
        chamber: billSummary.chamber === "House of Commons" ? "House" : "Senate"
      },
      dateIntroduced: billSummary.introducedOn,
      category: billSummary.genres?.[0] || billSummary.alignment || "Other",
      progress: progressMap[mappedStatus] || 20
    };
  };

  const handleViewDetails = (billId: string) => {
    router.push(`/bills/${billId}`);
  };

  // Collect unique sponsor parties from bills data
  const uniqueSponsorParties = useMemo(() => {
    const parties = new Set<string>();
    bills.forEach(bill => {
      if (bill.sponsorParty && bill.sponsorParty.trim()) {
        parties.add(bill.sponsorParty.trim());
      } else {
        // If no sponsorParty, it's from the Senate
        parties.add("Senate");
      }
    });
    return Array.from(parties).sort();
  }, [bills]);

  const filteredBills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = bills.filter((bill) => {
      const matchesQuery = !normalizedQuery
        ? true
        : [
          bill.title,
          bill.shortTitle ?? "",
          bill.description,
          bill.sponsorParty,
          bill.chamber,
          bill.summary ?? "",
          bill.genres?.join(" ") ?? "",
        ]
          .join("\n")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus = status ? bill.status === status : true;
      const matchesImpact = impact ? (bill.impact ?? "") === impact : true;
      const matchesJudgment = judgment ? bill.final_judgment === judgment : true;
      const matchesChamber = chamber ? bill.chamber === chamber : true;

      // Handle sponsor party filter - if no sponsorParty, treat as "Senate"
      const billSponsorParty = bill.sponsorParty && bill.sponsorParty.trim() ? bill.sponsorParty.trim() : "Senate";
      const matchesSponsorParty = sponsorParty ? billSponsorParty === sponsorParty : true;

      return matchesQuery && matchesStatus && matchesImpact && matchesJudgment && matchesChamber && matchesSponsorParty;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return (a.shortTitle || a.title).localeCompare(b.shortTitle || b.title);
        case "title-desc":
          return (b.shortTitle || b.title).localeCompare(a.shortTitle || a.title);
        case "introduced-asc":
          return new Date(a.introducedOn).getTime() - new Date(b.introducedOn).getTime();
        case "introduced-desc":
          return new Date(b.introducedOn).getTime() - new Date(a.introducedOn).getTime();
        case "lastUpdated-asc":
          return new Date(a.lastUpdatedOn).getTime() - new Date(b.lastUpdatedOn).getTime();
        case "lastUpdated-desc":
          return new Date(b.lastUpdatedOn).getTime() - new Date(a.lastUpdatedOn).getTime();
        case "status-asc":
          return a.status.localeCompare(b.status);
        case "status-desc":
          return b.status.localeCompare(a.status);
        case "party-asc":
          return a.sponsorParty.localeCompare(b.sponsorParty);
        case "party-desc":
          return b.sponsorParty.localeCompare(a.sponsorParty);
        default:
          return new Date(b.lastUpdatedOn).getTime() - new Date(a.lastUpdatedOn).getTime();
      }
    });

    return sorted;
  }, [bills, query, status, impact, judgment, chamber, sponsorParty, sortBy]);


  return (
    <>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="Search bills..."
          className="w-full sm:w-[320px] rounded border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="rounded border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm"
          value={chamber}
          onChange={(e) => setChamber(e.target.value)}
        >
          <option value="">All Chambers</option>
          <option>House of Commons</option>
          <option>Senate</option>
        </select>
        <select
          className="rounded border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm"
          value={sponsorParty}
          onChange={(e) => setSponsorParty(e.target.value)}
        >
          <option value="">All Parties</option>
          {uniqueSponsorParties.map((party) => (
            <option key={party} value={party}>
              {party}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm"
          value={judgment}
          onChange={(e) => setJudgment(e.target.value)}
        >
          <option value="">All Judgments</option>
          <option value="yes">Build Canada Supports</option>
          <option value="no">Build Canada Opposes</option>
          <option value="neutral">Build Canada Neutral</option>
        </select>
        <select
          className="rounded border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="lastUpdated-desc">Latest Updated</option>
          <option value="lastUpdated-asc">Oldest Updated</option>
          <option value="introduced-desc">Recently Introduced</option>
          <option value="introduced-asc">Oldest Introduced</option>

          <option value="party-asc">Party A-Z</option>
          <option value="party-desc">Party Z-A</option>
        </select>
      </div>

      {filteredBills.length === 0 ? (
        <div className="text-sm text-[var(--muted)]">No bills match your filters.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredBills.map((bill) => (
            <BillCard
              key={bill.billID}
              bill={transformBillSummaryToBill(bill)}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </>
  );
}


