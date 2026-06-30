import type { MetadataRoute } from "next";
import { getMergedBills } from "@/server/get-merged-bills";
import { buildRelativePath } from "@/utils/basePath";
import { getCanonicalOrigin } from "@/utils/seo";

// Served at /bills/sitemap.xml. Next.js does NOT prefix basePath into the URL
// strings, so we build fully-qualified canonical URLs via the helpers below.
export const revalidate = 3600; // 1 hour

function toDate(value?: string | Date): Date | undefined {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getCanonicalOrigin();
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: `${origin}${buildRelativePath()}`,
    changeFrequency: "hourly",
    priority: 1,
  };

  try {
    const bills = await getMergedBills();
    const billEntries: MetadataRoute.Sitemap = bills
      .filter((bill) => Boolean(bill.billID))
      .map((bill) => ({
        url: `${origin}${buildRelativePath(bill.billID)}`,
        lastModified: toDate(bill.lastUpdatedOn) ?? toDate(bill.introducedOn),
        changeFrequency: "daily",
        priority: 0.8,
      }));

    return [homeEntry, ...billEntries];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Never 500 the sitemap — fall back to the home entry.
    return [homeEntry];
  }
}
