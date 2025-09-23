"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardAction } from "../ui/card";
import { UnifiedBill } from "@/utils/billConverters";
import { Markdown } from "../Markdown/markdown";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { Link as LinkIcon, Copy as CopyIcon, Share2 as ShareIcon, ExternalLink } from "lucide-react";


export const BillQuestions = ({ bill }: { bill: UnifiedBill }) => {
  const [originAndPath, setOriginAndPath] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginAndPath(`${window.location.origin}${window.location.pathname}`);
    }
  }, []);

  const titleForShare = useMemo(() => {
    return bill.short_title || bill.title || bill.billId || "Bill";
  }, [bill.short_title, bill.title, bill.billId]);

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async (options: { text: string; url: string; }) => {
    const { text, url } = options;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: titleForShare, text, url });
        return;
      } catch {
        // fall through to twitter intent
      }
    }
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  const questions = bill.question_period_questions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Period Cards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {questions.map((q, idx) => {
            const anchorId = `q-${idx + 1}`;
            const shareUrl = originAndPath ? `${originAndPath}?q=${idx + 1}#${anchorId}` : `?q=${idx + 1}#${anchorId}`;
            const shareText = `Question for ${titleForShare}`;
            const composedCopy = `${q.question}\n\n${shareUrl}`;
            return (
              <a href={`#${anchorId}`} className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <Card key={anchorId} id={anchorId} className="border-[var(--panel-border)]">
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base">Question {idx + 1}</CardTitle>
                      <CardAction>
                        <div className="flex items-center gap-1">

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleShare({ text: shareText, url: shareUrl })}
                            aria-label="Share to social"
                          >
                            <ShareIcon className="size-4" />
                          </Button>
                        </div>
                      </CardAction>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm leading-6 prose prose-sm max-w-none">
                      <Markdown>{q.question}</Markdown>
                    </div>
                  </CardContent>

                </Card>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};