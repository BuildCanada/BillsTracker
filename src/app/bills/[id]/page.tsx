import Link from "next/link";
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";
import { getBillFromApi } from "@/services/billApi";
import { fromDbBill, fromApiBill, type UnifiedBill } from "@/utils/billConverters";
import {
  BillHeader,
  BillSummary,
  BillMetadata,
  BillFullText,
  BillAnalysis,
} from "@/components/BillDetail";

interface Params {
  params: { id: string };
}

export default async function BillDetail({ params }: Params) {
  // Try database first, then fallback to API
  const dbBill = await getBillByIdFromDB(params.id);
  let unifiedBill: UnifiedBill | null = null;

  if (dbBill) {
    unifiedBill = fromDbBill(dbBill);
  } else {
    const apiBill = await getBillFromApi(params.id);
    if (apiBill) {
      unifiedBill = await fromApiBill(apiBill);
    }
  }

  if (!unifiedBill) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-10">
        <h1 className="text-xl font-semibold">Bill not found</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          The bill you are looking for does not exist.
        </p>
        <Link className="mt-4 inline-block underline" href="/">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-8">
      <Link href="/" className="text-sm underline text-[var(--muted)]">
        ← Back to bills
      </Link>
      <BillHeader bill={unifiedBill} />

      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <BillSummary bill={unifiedBill} />
          <BillAnalysis bill={unifiedBill} />
          {/* <BillFullText bill={unifiedBill} /> */}
        </div>
        <div className="space-y-6">
          <BillMetadata bill={unifiedBill} />
        </div>
      </section>
    </div>
  );
}