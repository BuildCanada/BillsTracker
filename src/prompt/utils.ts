import {
  fetchBillMarkdown,
  getBillFromCivicsProjectApi,
} from "@/services/billApi";

export async function getBillMarkdown(billNumber: string): Promise<string> {
  // First fetch the bill details to get the source URL
  const bill = await getBillFromCivicsProjectApi(billNumber);
  if (!bill) {
    throw new Error(`Bill ${billNumber} not found`);
  }

  if (!bill.source) {
    throw new Error(`Bill ${billNumber} has no source URL`);
  }

  // Then fetch the markdown using the source URL
  const markdown = await fetchBillMarkdown(bill.source);
  if (!markdown) {
    throw new Error(`Could not fetch markdown for bill ${billNumber}`);
  }

  return markdown;
}
