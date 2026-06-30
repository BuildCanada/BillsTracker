import "server-only";
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";
import { getBillFromCivicsProjectApi } from "@/services/billApi";
import {
  fromBuildCanadaDbBill,
  fromCivicsProjectApiBill,
  type UnifiedBill,
} from "@/utils/billConverters";

export async function getUnifiedBillById(
  id: string,
): Promise<UnifiedBill | null> {
  const dbBill = await getBillByIdFromDB(id);
  if (dbBill) {
    return fromBuildCanadaDbBill(dbBill);
  }
  return null;
}

/**
 * Like {@link getUnifiedBillById}, but falls back to the Civics Project API
 * when the bill isn't in our database. Note the API path can trigger bill-text
 * fetching and AI summarization via `fromCivicsProjectApiBill`, so prefer the
 * DB-only `getUnifiedBillById` for cheap reads (e.g. OG image rendering).
 */
export async function getUnifiedBillByIdWithApiFallback(
  id: string,
): Promise<UnifiedBill | null> {
  const dbBill = await getUnifiedBillById(id);
  if (dbBill) {
    return dbBill;
  }

  const apiBill = await getBillFromCivicsProjectApi(id);
  return apiBill ? fromCivicsProjectApiBill(apiBill) : null;
}
