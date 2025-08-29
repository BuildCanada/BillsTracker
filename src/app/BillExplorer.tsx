"use client";

import { useMemo, useState } from "react";
import { BillSummary } from "./types";
import BillCard from "@/components/BillCard";


interface BillExplorerProps {
  bills: BillSummary[];
}

export default function BillExplorer({ bills }: BillExplorerProps) {
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [impact, setImpact] = useState<string>("");
  const [judgment, setJudgment] = useState<string>("");
  const [chamber, setChamber] = useState<string>("");

  const filteredBills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return bills.filter((bill) => {
      const matchesQuery = !normalizedQuery
        ? true
        : [
          bill.title,
          bill.short_title ?? "",
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

      return matchesQuery && matchesStatus && matchesImpact && matchesJudgment && matchesChamber;
    });
  }, [bills, query, status, impact, judgment, chamber]);


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
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option>Introduced</option>
          <option>In Progress</option>
          <option>Passed</option>
          <option>Failed</option>
          <option>Paused</option>
        </select>
        <select
          className="rounded border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm"
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
        >
          <option value="">All Impact</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
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
          value={judgment}
          onChange={(e) => setJudgment(e.target.value)}
        >
          <option value="">All Judgments</option>
          <option value="yes">Build Canada Supports</option>
          <option value="no">Build Canada Opposes</option>
          <option value="neutral">Build Canada Neutral</option>
        </select>
      </div>

      {filteredBills.length === 0 ? (
        <div className="text-sm text-[var(--muted)]">No bills match your filters.</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filteredBills.map((bill) => (
            <BillCard key={bill.billID} bill={bill} />
          ))}
        </ul>
      )}
    </>
  );
}


