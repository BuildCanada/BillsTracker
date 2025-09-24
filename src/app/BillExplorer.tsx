"use client";

import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { BillSummary } from "./types";
import BillCard from "@/components/BillCard";
import {
  FilterSidebar,
  FilterState,
  FilterOptions,
} from "@/components/FilterSection/filter-section.component";
import { useIsMobile } from "@/components/ui/use-mobile";

interface BillExplorerProps {
  bills: BillSummary[];
}

// type GroupedBills = Array<{
//   statusLabel: string;
//   key: string; // normalized status key
//   rank: number;
//   items: BillSummary[];
// }>;

// --- helpers ---------------------------------------------------------

/** Normalize status to a stable key (case/whitespace/emoji safe) */
function normalizeStatus(s?: string) {
  return (s || "unknown").toLowerCase().replace(/\s+/g, " ").trim();
}

// /** Pull a best-effort "updated at" date; fall back to introducedOn */
// function getUpdatedAt(b: any): number {
//   const candidates: Array<string | undefined> = [
//     b.updatedAt,
//     b.lastUpdated,
//     b.lastActionDate,
//     b.latestEventDate,
//     b.lastEventAt,
//     b.modifiedAt,
//     b.introducedOn,
//   ];
//   for (const d of candidates) {
//     const t = d ? new Date(d).getTime() : NaN;
//     if (!Number.isNaN(t)) return t;
//   }
//   return 0;
// }

/**
 * Assign an advancement rank (lower = more advanced).
 * Covers common Canadian bill stages + generic fallbacks.
 */
function statusRank(statusKey: string): number {
  // order buckets from most advanced to least
  const buckets: Array<[number, RegExp]> = [
    [0, /\b(royal assent|assented|became law)\b/],
    [1, /\b(passed both|passed parliament)\b/],
    [2, /\b(third reading).*(senate)\b/],
    [3, /\b(report stage).*(senate)\b/],
    [4, /\b(committee).*(senate)\b/],
    [5, /\b(second reading).*(senate)\b/],
    [6, /\b(passed senate)\b/],

    [7, /\b(third reading)\b/],
    [8, /\b(report stage)\b/],
    [9, /\b(committee)\b/],
    [10, /\b(second reading)\b/],
    [11, /\b(first reading|introduced|tabled|presented)\b/],

    [20, /\b(reinstated|restored)\b/],
    [30, /\b(inactive|no further action)\b/],
    [40, /\b(defeated|failed|died|withdrawn)\b/],
  ];

  for (const [rank, rx] of buckets) {
    if (rx.test(statusKey)) return rank;
  }
  return 25; // unknown/misc middle bucket
}

// /** Humanize a normalized status using the most common original label seen */
// function pickLabel(statusKey: string, originals: string[]) {
//   // choose the most frequent original label for prettier headings
//   const counts = new Map<string, number>();
//   for (const s of originals) counts.set(s, (counts.get(s) || 0) + 1);
//   return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || statusKey;
// }

// --------------------------------------------------------------------

function BillExplorer({ bills }: BillExplorerProps) {
  const isMobile = useIsMobile();
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    category: [],
    party: [],
    chamber: [],
    dateRange: "all",
    judgement: [],
  });

  // Filter bills
  const filteredBills = useMemo(() => {
    const filtered = bills.filter((bill) => {
      // Search
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const qNormalized = q.replace(/[\s-]/g, "");

        const haystack = [
          bill.billID,
          bill.title,
          bill.description,
          bill.summary || "",
          bill.shortTitle || "",
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());

        const hayJoined = haystack.join(" ");
        const hayNormalized = haystack.map((value) =>
          value.replace(/[\s-]/g, ""),
        );

        const matchesSearch =
          hayJoined.includes(q) ||
          (qNormalized !== "" &&
            hayNormalized.some((value) => value.includes(qNormalized)));

        if (!matchesSearch) return false;
      }

      // Status (normalize both sides)
      if (filters.status.length > 0) {
        const billStatusKey = normalizeStatus(bill.status);
        const activeStatusKeys = filters.status.map(normalizeStatus);
        if (!activeStatusKeys.includes(billStatusKey)) return false;
      }

      // Category (alignment + genres)
      if (filters.category.length > 0) {
        let ok = false;
        if (bill.alignment && filters.category.includes(bill.alignment))
          ok = true;
        if (bill.genres?.some((g: string) => filters.category.includes(g)))
          ok = true;
        if (!ok) return false;
      }

      // Judgement (final_judgment)
      if (filters.judgement.length > 0) {
        const j = bill.final_judgment;
        if (!j || !filters.judgement.includes(j)) return false;
      }

      // Party
      if (
        filters.party.length > 0 &&
        bill.sponsorParty &&
        !filters.party.includes(bill.sponsorParty)
      ) {
        return false;
      }

      // Chamber
      if (filters.chamber.length > 0) {
        const chamber =
          bill.chamber === "House of Commons" ? "House" : "Senate";
        if (!filters.chamber.includes(chamber)) return false;
      }

      // Date range (introducedOn)
      if (filters.dateRange && filters.dateRange !== "all") {
        const now = new Date();
        const billDate = new Date(bill.introducedOn);
        let cutoff: Date;
        switch (filters.dateRange) {
          case "last-month":
            cutoff = new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              now.getDate(),
            );
            break;
          case "last-3-months":
            cutoff = new Date(
              now.getFullYear(),
              now.getMonth() - 3,
              now.getDate(),
            );
            break;
          case "last-6-months":
            cutoff = new Date(
              now.getFullYear(),
              now.getMonth() - 6,
              now.getDate(),
            );
            break;
          case "last-year":
            cutoff = new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate(),
            );
            break;
          default:
            cutoff = new Date(0);
        }
        if (billDate < cutoff) return false;
      }

      return true;
    });

    console.log("Filtering results:", {
      totalBills: bills.length,
      filteredBills: filtered.length,
      activeFilters: filters,
    });

    return filtered;
  }, [bills, filters]);

  // Grouping disabled for now
  // const grouped: GroupedBills = useMemo(() => {
  //   // collect originals per status for nicer headings
  //   const originalsByKey = new Map<string, string[]>();
  //   const groups = new Map<string, BillSummary[]>();
  //
  //   for (const b of filteredBills) {
  //     const key = normalizeStatus(b.status);
  //     if (!groups.has(key)) groups.set(key, []);
  //     groups.get(key)!.push(b);
  //
  //     const origs = originalsByKey.get(key) || [];
  //     origs.push(b.status || "Unknown");
  //     originalsByKey.set(key, origs);
  //   }
  //
  //   // build array with rank + sort items by updated desc
  //   const arr: GroupedBills = [...groups.entries()].map(([key, items]) => {
  //     const rank = statusRank(key);
  //     items.sort((a, b) => getUpdatedAt(b) - getUpdatedAt(a));
  //     const label = pickLabel(key, originalsByKey.get(key) || []);
  //     return { statusLabel: label, key, rank, items };
  //   });
  //
  //   // sort groups by advancement rank, then by most recent item in each group
  //   arr.sort((g1, g2) => {
  //     if (g1.rank !== g2.rank) return g1.rank - g2.rank;
  //     const g1Latest = getUpdatedAt(g1.items[0]);
  //     const g2Latest = getUpdatedAt(g2.items[0]);
  //     return g2Latest - g1Latest;
  //   });
  //
  //   return arr;
  // }, [filteredBills]);

  // Sidebar filter options (normalize statuses for consistency)
  const filterOptions: FilterOptions = useMemo(() => {
    const statusKeyToLabel = new Map<string, string>();
    const partySet = new Set<string>();
    const chamberSet = new Set<string>();
    const categorySet = new Set<string>();

    bills.forEach((bill) => {
      // statuses
      const key = normalizeStatus(bill.status);
      if (bill.status) statusKeyToLabel.set(key, bill.status);

      // parties
      if (bill.sponsorParty?.trim()) partySet.add(bill.sponsorParty.trim());

      // chamber
      if (bill.chamber) {
        const chamber =
          bill.chamber === "House of Commons" ? "House" : "Senate";
        chamberSet.add(chamber);
      }

      // categories
      if (bill.genres) {
        bill.genres.forEach((g: string) => {
          if (g?.trim()) categorySet.add(g.trim());
        });
      }
      if (bill.alignment) categorySet.add(bill.alignment);
    });

    // present statuses sorted by advancement rank
    const statuses = [...statusKeyToLabel.entries()]
      .map(([key, label]) => ({ key, label, rank: statusRank(key) }))
      .sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label))
      .map((x) => x.label);

    const options = {
      statuses,
      parties: Array.from(partySet).sort(),
      chambers: Array.from(chamberSet).sort(),
      categories: Array.from(categorySet).sort(),
    };

    console.log("Filter options generated:", options);
    console.log("Total bills:", bills.length);

    return options;
  }, [bills]);

  // Keep filters panel behavior
  useEffect(() => {
    setIsFilterCollapsed(isMobile);
  }, [isMobile]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      status: [],
      category: [],
      party: [],
      chamber: [],
      dateRange: "all",
      judgement: [],
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl py-4 md:py-6">
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <aside className="w-full md:w-auto md:min-w-[260px] md:max-w-xs md:shrink-0">
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            forceCollapsed={isFilterCollapsed}
            onCollapsedChange={setIsFilterCollapsed}
            filterOptions={filterOptions}
          />
        </aside>

        <main className="flex-1">
          {filteredBills.length === 0 ? (
            <div className="text-sm">No bills match your filters.</div>
          ) : (
            <ul className="flex flex-col gap-3">
              {filteredBills.map((bill) => (
                <BillCard key={bill.billID} bill={bill} />
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(BillExplorer);
