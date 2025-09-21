
import "server-only";
import { connectToDatabase } from "@/lib/mongoose";
import { Bill } from "@/models/Bill";
import type { BillDocument } from "@/models/Bill";
import { unstable_cache } from 'next/cache';

async function _getAllBillsFromDB(): Promise<BillDocument[]> {
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

    // Ensure proper serialization by converting to plain objects
    return bills.map(bill => JSON.parse(JSON.stringify(bill))) as BillDocument[];
  } catch (error) {
    console.error("Error fetching bills from MongoDB:", error);
    return [];
  }
}

// Cache database bills for 5 minutes in production, no cache in development
export const getAllBillsFromDB = process.env.NODE_ENV === 'production'
  ? unstable_cache(
    _getAllBillsFromDB,
    ['all-bills-from-db'],
    {
      revalidate: 300,
      tags: ['bills']
    }
  )
  : _getAllBillsFromDB;


