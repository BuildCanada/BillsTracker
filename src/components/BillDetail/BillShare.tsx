"use client";

import { useEffect, useMemo, useState } from "react";
import { UnifiedBill } from "@/utils/billConverters";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Facebook, LinkIcon, MessageCircle } from "lucide-react";
import { cn } from "../ui/utils";

interface BillShareProps {
  bill: UnifiedBill;
  shareUrl: string;
  className?: string;
  variant?: "card" | "compact";
}

const XLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    role="img"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      d="M3.5 3h4.89l3.75 5.63L16.78 3H21l-6.01 7.91L21.5 21h-4.89l-4.05-6.07L7.22 21H3l6.37-8.39L3.5 3Z"
      fill="currentColor"
    />
  </svg>
);

export function BillShare({ bill, shareUrl, className, variant = "card" }: BillShareProps) {
  const [copied, setCopied] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState(shareUrl);

  useEffect(() => {
    if (!shareUrl) {
      setResolvedUrl("");
      return;
    }

    if (shareUrl.startsWith("http")) {
      setResolvedUrl(shareUrl);
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const absolute = new URL(shareUrl, window.location.origin).toString();
        setResolvedUrl(absolute);
      } catch (error) {
        console.error("Failed to resolve share URL", error);
        setResolvedUrl(shareUrl);
      }
    }
  }, [shareUrl]);

  const shareTitle = bill.short_title || bill.title;
  const shareSummary = useMemo(() => {
    if (!bill.summary) return "";
    const plain = bill.summary.replace(/\s+/g, " ").trim();
    return plain.slice(0, 140);
  }, [bill.summary]);

  const xShareUrl = useMemo(() => {
    if (!resolvedUrl) return "";
    const textParts = [`${shareTitle} — Analysis on Build Canada Bills`];
    if (shareSummary) {
      textParts.push(shareSummary);
    }
    const params = new URLSearchParams({
      text: textParts.join("\n\n"),
      url: resolvedUrl,
    });
    params.set("via", "buildcanadabills");

    return `https://x.com/intent/post?${params.toString()}`;
  }, [resolvedUrl, shareTitle, shareSummary]);

  const facebookShareUrl = useMemo(() => {
    if (!resolvedUrl) return "";
    const params = new URLSearchParams({ u: resolvedUrl });
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }, [resolvedUrl]);

  const whatsappShareUrl = useMemo(() => {
    if (!resolvedUrl) return "";
    const params = new URLSearchParams();
    params.set("text", `${shareTitle}\n${resolvedUrl}`);
    return `https://wa.me/?${params.toString()}`;
  }, [resolvedUrl, shareTitle]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    if (!resolvedUrl) return;

    try {
      const canUseClipboard = typeof navigator !== "undefined" && "clipboard" in navigator && window.isSecureContext;
      if (canUseClipboard) {
        await navigator.clipboard.writeText(resolvedUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = resolvedUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy share URL", error);
    }
  };

  const openShareWindow = (url: string) => {
    if (!url || typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const actions = [
    {
      key: "x",
      label: "Share on X",
      icon: <XLogo className="size-4" />,
      onClick: () => openShareWindow(xShareUrl),
      disabled: !xShareUrl,
    },
    {
      key: "facebook",
      label: "Share on Facebook",
      icon: <Facebook className="size-4" />,
      onClick: () => openShareWindow(facebookShareUrl),
      disabled: !facebookShareUrl,
    },
    {
      key: "whatsapp",
      label: "Share on WhatsApp",
      icon: <MessageCircle className="size-4" />,
      onClick: () => openShareWindow(whatsappShareUrl),
      disabled: !whatsappShareUrl,
    },
    {
      key: "copy",
      label: copied ? "Link copied" : "Copy link",
      icon: <LinkIcon className="size-4" />,
      onClick: handleCopy,
      disabled: !resolvedUrl,
    },
  ];

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {actions.map((action) => (
          <Button
            key={action.key}
            variant="ghost"
            size="icon"
            onClick={action.onClick}
            disabled={action.disabled}
            aria-label={action.label}
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}
        <span className="sr-only" role="status" aria-live="polite">
          {copied ? "Share link copied to clipboard" : ""}
        </span>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Share</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Spread the word about {shareTitle} and help more Canadians stay informed.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {actions.map((action) => (
            <Button
              key={action.key}
              variant="outline"
              className="justify-start w-full sm:w-auto sm:flex-1"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        {resolvedUrl && (
          <div className="rounded-md border border-dashed border-muted p-3 text-xs text-muted-foreground break-all">
            {resolvedUrl}
          </div>
        )}
        <span className="sr-only" role="status" aria-live="polite">
          {copied ? "Share link copied to clipboard" : ""}
        </span>


      </CardContent>
    </Card>
  );
}