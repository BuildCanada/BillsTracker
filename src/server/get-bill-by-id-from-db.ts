import "server-only";
import { connectToDatabase } from "@/lib/mongoose";
import { Bill } from "@/models/Bill";
import type { BillDocument } from "@/models/Bill";

export async function getBillByIdFromDB(billId: string): Promise<BillDocument | null> {
  const uri = process.env.MONGO_URI || "";
  const hasValidMongoUri = uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
  if (!hasValidMongoUri) return null;

  await connectToDatabase();
  const existing = (await Bill.findOne({ billId }).lean().exec()) as BillDocument | null;
  return existing;
}


