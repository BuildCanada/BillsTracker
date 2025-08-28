"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BillSummary } from "./types";
import { getPartyColor } from "@/utils/get-party-colors/get-party-colors.util";
type StageStyle = { dot: string; chipBg: string; chipText: string };

function getStageStyle(bill: BillSummary): StageStyle {
  const stage = (bill.stage ?? bill.status ?? "").toLowerCase();
  // Stage keyword precedence
  if (stage.includes("royal assent") || stage.includes("passed")) {
    return { dot: "bg-emerald-500", chipBg: "bg-emerald-100", chipText: "text-emerald-700" };
  }
  if (stage.includes("failed") || stage.includes("defeat")) {
    return { dot: "bg-rose-500", chipBg: "bg-rose-100", chipText: "text-rose-700" };
  }
  if (stage.includes("third reading")) {
    return { dot: "bg-amber-500", chipBg: "bg-amber-100", chipText: "text-amber-700" };
  }
  if (stage.includes("report")) {
    return { dot: "bg-indigo-500", chipBg: "bg-indigo-100", chipText: "text-indigo-700" };
  }
  if (stage.includes("committee")) {
    return { dot: "bg-violet-500", chipBg: "bg-violet-100", chipText: "text-violet-700" };
  }
  if (stage.includes("second reading")) {
    return { dot: "bg-sky-500", chipBg: "bg-sky-100", chipText: "text-sky-700" };
  }
  if (stage.includes("first reading") || stage.includes("introduced")) {
    return { dot: "bg-sky-500", chipBg: "bg-sky-100", chipText: "text-sky-700" };
  }
  if (stage.includes("senate")) {
    return { dot: "bg-fuchsia-500", chipBg: "bg-fuchsia-100", chipText: "text-fuchsia-700" };
  }
  if (stage.includes("paused")) {
    return { dot: "bg-slate-400", chipBg: "bg-slate-200", chipText: "text-slate-700" };
  }
  // Fallback by status
  if (bill.status === "Passed") return { dot: "bg-emerald-500", chipBg: "bg-emerald-100", chipText: "text-emerald-700" };
  if (bill.status === "Failed") return { dot: "bg-rose-500", chipBg: "bg-rose-100", chipText: "text-rose-700" };
  if (bill.status === "Introduced") return { dot: "bg-sky-500", chipBg: "bg-sky-100", chipText: "text-sky-700" };
  if (bill.status === "In Progress") return { dot: "bg-amber-500", chipBg: "bg-amber-100", chipText: "text-amber-700" };
  if (bill.status === "Paused") return { dot: "bg-slate-400", chipBg: "bg-slate-200", chipText: "text-slate-700" };
  return { dot: "bg-slate-400", chipBg: "bg-slate-200", chipText: "text-slate-700" };
}

function StatusDot({ bill }: { bill: BillSummary }) {
  const { dot } = getStageStyle(bill);
  return <span className={`inline-block h-[10px] w-[10px] rounded-full ${dot}`} />;
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
          bill.sponsorParty,
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
                <div className="flex items-start gap-3 pt-1">
                  <StatusDot bill={bill} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 -mt-1.5">
                      <h2 className="text-base font-semibold">{bill.title}</h2>
                      {(() => {
                        const { chipBg, chipText } = getStageStyle(bill);
                        return (
                          <span className={`text-xs rounded-full px-2 py-0.5 ${chipBg} ${chipText}`}>
                            {bill.status}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{bill.description}</p>
                    <div className="mt-2 text-xs text-[var(--muted)]">
                      <span style={{ backgroundColor: getPartyColor(bill.sponsorParty).backgroundColor, color: getPartyColor(bill.sponsorParty).color }} className={`rounded-full px-2 py-0.5 `}>{bill.sponsorParty}</span>
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


