import "server-only";
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";
import { fromDbBill, type UnifiedBill } from "@/utils/billConverters";

export async function getUnifiedBillById(id: string): Promise<UnifiedBill | null> {
  const dbBill = await getBillByIdFromDB(id);
  if (dbBill) {
    return fromDbBill(dbBill);
  }
  return null;
}


