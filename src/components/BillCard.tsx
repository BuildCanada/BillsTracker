import Link from "next/link";
import { BillSummary } from "@/app/types";
import { getPartyColor } from "@/utils/get-party-colors/get-party-colors.util";
import { VoteBadge } from "@/components/VoteBadge/VoteBadge.component";

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

interface BillCardProps {
  bill: BillSummary;
}

export default function BillCard({ bill }: BillCardProps) {

  const updatedAt = bill.lastUpdatedOn;
  console.log({ bill });
  return (
    <li className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-0 shadow-sm overflow-hidden relative">
      <Link href={`/bills/${bill.billID}`} className="block p-4 hover:bg-black/5">
        <div className="flex items-start gap-3 pt-1">
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2 -mt-1.5">
              <h2 className="text-xl font-semibold max-w-[70%]">{bill.shortTitle ?? bill.title}</h2>
              {/* {bill.final_judgment && (
                <div className="flex-shrink-0 mt-1">
                  <VoteBadge vote={bill.final_judgment} size="sm" />
                </div>
              )} */}
            </div>

            {bill.genres && bill.genres.length > 0 && (
              <div className="mt-2  flex flex-wrap gap-1   left-4">
                {bill.genres.map((genre, index) => (
                  <div key={index} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">
                    {genre}
                  </div>
                ))}
                {bill.genres.length > 3 && (
                  <div className="text-xs text-[var(--muted)]\">+{bill.genres.length - 3} more</div>
                )}
                <span
                  style={{
                    backgroundColor: getPartyColor(bill.sponsorParty).backgroundColor,
                    color: getPartyColor(bill.sponsorParty).color
                  }}
                  className="rounded-full px-2 py-0.5 text-xs"
                >
                  {bill.sponsorParty}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              {/* <span className={`text-xs rounded-full px-2 py-0.5 ${chipBg} ${chipText}`}>
                {bill.status}
              </span> */}

              <span className="text-[var(--muted)] absolute right-4">Updated {new Date(updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
