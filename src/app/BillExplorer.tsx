"use client";

import { useEffect, useMemo, useState } from "react";
import { BillSummary } from "./types";
import BillCard from "@/components/BillCard";
import { FilterSidebar, FilterState } from "@/components/FilterSection/filter-section.component";
import { useIsMobile } from "@/components/ui/use-mobile";

interface BillExplorerProps {
  bills: BillSummary[];
}

export default function BillExplorer({ bills }: BillExplorerProps) {
  const isMobile = useIsMobile();
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    category: [],
    party: [],
    chamber: [],
    dateRange: "all",
  });

  // Filter bills based on current filter state
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      // Search filter - search in title, description, and summary
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          bill.title,
          bill.description,
          bill.summary || "",
          bill.shortTitle || ""
        ].join(" ").toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(bill.status.toLowerCase())) {
        return false;
      }

      // Category filter (using alignment field as category)
      if (filters.category.length > 0 && bill.alignment && !filters.category.includes(bill.alignment)) {
        return false;
      }

      // Party filter (using sponsorParty field)
      if (filters.party.length > 0 && !filters.party.includes(bill.sponsorParty)) {
        return false;
      }

      // Chamber filter
      if (filters.chamber.length > 0) {
        const chamber = bill.chamber === "House of Commons" ? "House" : "Senate";
        if (!filters.chamber.includes(chamber)) {
          return false;
        }
      }

      // Date range filter based on introducedOn
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        const billDate = new Date(bill.introducedOn);
        let cutoffDate: Date;

        switch (filters.dateRange) {
          case 'last-month':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
          case 'last-3-months':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
          case 'last-6-months':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
          case 'last-year':
            cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
          default:
            cutoffDate = new Date(0); // No filter
        }

        if (billDate < cutoffDate) {
          return false;
        }
      }

      return true;
    });
  }, [bills, filters]);


  useEffect(() => {
    setIsFilterCollapsed(isMobile);
  }, [isMobile]);

  // Function to force collapse the filter section
  const forceCollapseFilters = () => {
    setIsFilterCollapsed(true);
  };

  // Function to force expand the filter section
  const forceExpandFilters = () => {
    setIsFilterCollapsed(false);
  };

  // Function to toggle the filter section
  const toggleFilterCollapse = () => {
    setIsFilterCollapsed(!isFilterCollapsed);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: [],
      category: [],
      party: [],
      chamber: [],
      dateRange: "all",
    });
  };

  // Collect unique sponsor parties from bills data
  const uniqueSponsorParties = useMemo(() => {
    const parties = new Set<string>();
    bills.forEach((bill) => {
      if (bill.sponsorParty && bill.sponsorParty.trim()) {
        parties.add(bill.sponsorParty.trim());
      } else {
        // If no sponsorParty, it's from the Senate
        parties.add("Senate");
      }
    });
    return Array.from(parties).sort();
  }, [bills]);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Layout wrapper: stacked on mobile, two-column on desktop */}
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        {/* FILTERS */}
        <aside
          className="
            w-full md:w-auto
            md:min-w-[260px] md:max-w-xs md:shrink-0
          "
        >
          {/* Provide your sidebar full-width on mobile, fixed-ish width on desktop */}

          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            forceCollapsed={isFilterCollapsed}
            onCollapsedChange={setIsFilterCollapsed}
          />
        </aside>

        {/* BILL LIST */}
        <main className="flex-1">


          {filteredBills.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">No bills match your filters.</div>
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