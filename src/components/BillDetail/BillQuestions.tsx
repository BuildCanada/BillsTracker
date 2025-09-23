"use client";

import { Card, CardHeader, CardTitle, CardContent, CardAction } from "../ui/card";
import { UnifiedBill } from "@/utils/billConverters";
import { Markdown } from "../Markdown/markdown";
import { Button } from "../ui/button";
import { useMemo } from "react";
import { Share2 as ShareIcon } from "lucide-react";


export const BillQuestions = ({ bill, billSlug, origin }: { bill: UnifiedBill; billSlug: string; origin: string }) => {
  const titleForShare = useMemo(() => {
    return bill.short_title || bill.title || bill.billId || "Bill";
  }, [bill.short_title, bill.title, bill.billId]);

  const baseOrigin = useMemo(() => {
    if (origin && origin.length > 0) {
      return origin.replace(/\/$/, "");
    }
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    return "";
  }, [origin]);

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
            const shareUrlBase = `${baseOrigin}/${billSlug}/q/${idx + 1}`;
            const shareText = `Question ${idx + 1} for ${titleForShare}`;
            return (
              <a key={anchorId} href={`#${anchorId}`} className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <Card id={anchorId} className="border-[var(--panel-border)]">
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base">Question {idx + 1}</CardTitle>
                      <CardAction>
                        <div className="flex items-center gap-1">

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleShare({ text: shareText, url: shareUrlBase });
                            }}
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