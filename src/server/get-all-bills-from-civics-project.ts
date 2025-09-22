import { BillSummary } from "@/app/types";

export async function getBillsFromCivicsProject(): Promise<BillSummary[]> {
  const response = await fetch(
    "https://api.civicsproject.org/bills/region/canada/45",
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CIVICS_PROJECT_API_KEY}`
      }
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch bills from API");
  }
  const { data } = await response.json();
  return Array.isArray(data) ? (data as BillSummary[]) : data?.bills ?? [];
}
