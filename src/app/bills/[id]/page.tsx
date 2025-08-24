import Link from "next/link";

interface Params {
  params: { id: string };
}

type ApiStage = { stage: string; state: string; house: string; date: string };
type ApiBillDetail = {
  _id?: string;
  internalID?: string;
  billID: string;
  title: string;
  shortTitle?: string;
  header: string;
  summary?: string;
  genres?: string[];
  date: string;
  updatedAt?: string;
  status: string;
  stage?: string;
  stages?: ApiStage[];
  sponsorParty?: string;
  sponsorID?: string[];
  sponsorName?: string[];
  parliamentNumber: number;
  sessionNumber: number;
  supportedRegion?: string;
  interestLevel?: number;
  source?: string;
  votes?: unknown[];
  billTexts?: unknown[];
};

const CANADIAN_PARLIAMENT_NUMBER = 45;


async function getBillDetail(billId: string): Promise<ApiBillDetail | null> {
  const URL = `https://api.civicsproject.org/bills/canada/${billId.toLowerCase()}/${CANADIAN_PARLIAMENT_NUMBER}`;
  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIVICS_PROJECT_API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch bill details");
  }
  const json = await response.json();
  const data = (json?.data?.bill ?? json?.data ?? json) as ApiBillDetail | ApiBillDetail[] | null;
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.find((b) => b.billID?.toLowerCase() === billId.toLowerCase()) ?? null;
  }
  return data;
}

export default async function BillDetail({ params }: Params) {
  const bill = await getBillDetail(params.id);

  if (!bill) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-10">
        <h1 className="text-xl font-semibold">Bill not found</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">The bill you are looking for does not exist.</p>
        <Link className="mt-4 inline-block underline" href="/">Back to list</Link>
      </div>
    );
  }

  const latestStageDate = bill.stages && bill.stages.length > 0
    ? bill.stages[bill.stages.length - 1].date
    : bill.updatedAt ?? bill.date;
  const house = bill.stages && bill.stages.length > 0 ? bill.stages[bill.stages.length - 1].house : undefined;

  return (
    <div className="mx-auto max-w-[900px] px-6 py-8">
      <Link href="/" className="text-sm underline text-[var(--muted)]">← Back to bills</Link>
      <header className="mt-3 pb-4 border-b border-[var(--panel-border)]">
        {bill.supportedRegion && (
          <div className="text-[13px] uppercase tracking-wide rounded bg-[var(--chip-bg)] text-[var(--chip-text)] px-2 py-1 inline-block">{bill.supportedRegion}</div>
        )}
        <h1 className="mt-2 text-[28px] font-semibold">{bill.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {bill.sponsorParty ? `Sponsored by ${bill.sponsorParty}` : null}
          {house ? ` • ${house}` : null}
        </p>
      </header>

      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <article className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5">
          <h2 className="font-semibold mb-2">Summary</h2>
          <p className="text-sm leading-6 text-[var(--muted)]">{bill.header}</p>
        </article>
        <aside className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5 text-sm">
          <div className="flex items-center justify-between py-1"><span className="text-[var(--muted)]">Status</span><span className="font-medium">{bill.status}</span></div>
          <div className="flex items-center justify-between py-1"><span className="text-[var(--muted)]">Introduced</span><span>{new Date(bill.date).toLocaleDateString()}</span></div>
          <div className="flex items-center justify-between py-1"><span className="text-[var(--muted)]">Last updated</span><span>{new Date(latestStageDate).toLocaleDateString()}</span></div>
          {bill.genres && bill.genres.length > 0 && (
            <div className="flex items-center justify-between py-1"><span className="text-[var(--muted)]">Genres</span><span>{bill.genres.join(", ")}</span></div>
          )}
          {typeof bill.parliamentNumber !== "undefined" && typeof bill.sessionNumber !== "undefined" && (
            <div className="flex items-center justify-between py-1"><span className="text-[var(--muted)]">Parliament</span><span>{bill.parliamentNumber}-{bill.sessionNumber}</span></div>
          )}
          <div className="flex items-center justify-between py-1"><span className="text-[var(--muted)]">Bill ID</span><span>{bill.billID}</span></div>
        </aside>
      </section>
    </div>
  );
}


