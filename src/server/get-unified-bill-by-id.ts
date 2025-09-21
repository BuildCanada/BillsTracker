import "server-only";
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";
import { getBillFromApi } from "@/services/billApi";
import { fromDbBill, fromApiBill, type UnifiedBill } from "@/utils/billConverters";

export async function getUnifiedBillById(id: string): Promise<UnifiedBill | null> {
  const dbBill = await getBillByIdFromDB(id);
  if (dbBill) return fromDbBill(dbBill);

  const apiBill = await getBillFromApi(id);
  if (apiBill) return fromApiBill(apiBill);

  return null;
}


