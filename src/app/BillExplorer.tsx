"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BillSummary } from "./types";

const STATUS_COLORS: Record<string, string> = {
  Passed: "bg-emerald-500",
  "In Progress": "bg-amber-500",
  Introduced: "bg-sky-500",
  Failed: "bg-rose-500",
  Paused: "bg-slate-400",
};

function StatusDot({ status }: { status: BillSummary["status"] }) {
  const color = STATUS_COLORS[status] ?? "bg-slate-400";
  return <span className={`inline-block h-[10px] w-[10px] rounded-full ${color}`} />;
}

interface BillExplorerProps {
  bills: BillSummary[];
}

export default function BillExplorer({ bills }: BillExplorerProps) {
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [impact, setImpact] = useState<string>("");

  const filteredBills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return bills.filter((bill) => {
      const matchesQuery = !normalizedQuery
        ? true
        : [
          bill.title,
          bill.shortTitle ?? "",
          bill.description,
          bill.sponsor,
          bill.chamber,
        ]
          .join("\n")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus = status ? bill.status === status : true;
      const matchesImpact = impact ? (bill.impact ?? "") === impact : true;

      return matchesQuery && matchesStatus && matchesImpact;
    });
  }, [bills, query, status, impact]);

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
      </div>

      {filteredBills.length === 0 ? (
        <div className="text-sm text-[var(--muted)]">No bills match your filters.</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filteredBills.map((bill) => (
            <li
              key={bill.billID}
              className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-0 shadow-sm overflow-hidden"
            >
              <Link href={`/bills/${bill.billID}`} className="block p-4 hover:bg-black/5">
                <div className="flex items-start gap-3">
                  <StatusDot status={bill.status} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold">{bill.title}</h2>
                      <span className="text-xs rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5">
                        {bill.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{bill.description}</p>
                    <div className="mt-2 text-xs text-[var(--muted)]">
                      <span>Sponsored by {bill.sponsor}</span>
                      <span className="mx-2">•</span>
                      <span>{bill.chamber}</span>
                      <span className="mx-2">•</span>
                      <span>Updated {new Date(bill.lastUpdatedOn).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}


