import "server-only";
import { cache } from "react";
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";
import { getBillFromCivicsProjectApi } from "@/services/billApi";
import {
  fromBuildCanadaDbBill,
  fromCivicsProjectApiBill,
  type UnifiedBill,
} from "@/utils/billConverters";

/**
 * Resolve a single bill (DB first, Civics Project API fallback) into a UnifiedBill.
 * Wrapped in React `cache()` so a request that calls this from both
 * `generateMetadata` and the page component only performs the fetch once.
 */
export const getUnifiedBillById = cache(
  async (id: string): Promise<UnifiedBill | null> => {
    const dbBill = await getBillByIdFromDB(id);
    if (dbBill) {
      return fromBuildCanadaDbBill(dbBill);
    }

    const apiBill = await getBillFromCivicsProjectApi(id);
    if (apiBill) {
      return fromCivicsProjectApiBill(apiBill);
    }

    return null;
  },
);
