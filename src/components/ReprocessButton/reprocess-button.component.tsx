"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BASE_PATH } from "@/utils/basePath";

interface ReprocessButtonProps {
  billId: string;
}

export const ReprocessButton = ({ billId }: ReprocessButtonProps) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReprocess = async () => {
    const confirmed = window.confirm(
      "Re-run the AI analysis for this bill? This will overwrite the summary, judgment, rationale, steel man, tenet evaluations and Question Period questions.",
    );
    if (!confirmed) return;

    setIsPending(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_PATH}/api/${billId}/reprocess`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      // Reload so the form re-renders with the freshly generated analysis.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleReprocess}
          disabled={isPending}
        >
          {isPending ? "Reprocessing…" : "Re-run AI Summary"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Regenerates all AI fields from the latest bill text.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
