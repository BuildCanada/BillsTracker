import { BillSummary } from "./types";
import BillExplorer from "./BillExplorer";
import FAQModalTrigger from "./FAQModalTrigger";

async function getBills(): Promise<BillSummary[]> {
  const response = await fetch("https://api.civicsproject.org/bills/region/canada/45", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIVICS_PROJECT_API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch bills");
  }
  const { data } = await response.json();
  // Accept either an array response or an object with a `bills` array
  return Array.isArray(data) ? (data as BillSummary[]) : (data?.bills ?? []);
}

export default async function Home() {
  const bills = await getBills();
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1120px] px-6 py-8  gap-8">
        {/* <aside className="rounded-md bg-[var(--panel)] p-5 shadow-sm border border-[var(--panel-border)]">
          <div className="text-[28px] leading-[1.1] font-semibold tracking-tight">Outcomes Tracker</div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            A non-partisan platform tracking progress of key commitments during the 45th Parliament of Canada.
          </p>
          <FAQModalTrigger />
        </aside> */}
        <main>
          <header className="flex items-center gap-4 pb-4 border-b border-[var(--panel-border)]">
            <h1 className="text-[24px] font-semibold">Build Canada Bills</h1>
          </header>

          <section className="mt-6">
            <BillExplorer bills={bills} />
          </section>
        </main>
      </div>
    </div>
  );
}
