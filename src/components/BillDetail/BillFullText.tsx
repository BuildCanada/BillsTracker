import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UnifiedBill } from "@/utils/billConverters";

interface BillFullTextProps {
  bill: UnifiedBill;
}

export function BillFullText({ bill }: BillFullTextProps) {
  if (!bill.fullTextMarkdown) return null;

  return (
    <article className="rounded-md border border-[var(--panel-border)] bg-[var(--panel)] p-5">
      <h2 className="font-semibold mb-2">Full Text</h2>
      <div className="text-sm leading-6 text-[var(--muted)]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {bill.fullTextMarkdown}
        </ReactMarkdown>
      </div>
    </article>
  );
}
