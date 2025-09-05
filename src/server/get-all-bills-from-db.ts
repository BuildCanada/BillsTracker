
import "server-only";
import { connectToDatabase } from "@/lib/mongoose";
import { Bill } from "@/models/Bill";
import type { BillDocument } from "@/models/Bill";

export async function getAllBillsFromDB(): Promise<BillDocument[]> {

  const uri = process.env.MONGO_URI || "";
  const hasValidMongoUri = uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
  if (!hasValidMongoUri) {
    console.warn("!!! No valid MongoDB URI found, returning empty bills array");
    return [];
  }

  try {
    await connectToDatabase();
    const bills = await Bill.find({}).lean().exec();
    console.log(`Fetched ${bills.length} bills from MongoDB`);
    return bills as unknown as BillDocument[];
  } catch (error) {
    console.error("Error fetching bills from MongoDB:", error);
    return [];
  }
}


