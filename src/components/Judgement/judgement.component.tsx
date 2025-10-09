import { CheckCircle2, XCircle, CircleMinus } from "lucide-react";
import React from "react";

export type JudgementValue = "yes" | "no" | "neutral";
type Size = "sm" | "md";

const stylesByJudgement: Record<
  JudgementValue,
  {
    wrap: { subtle: string; outline: string };
    iconWrap: string;
    icon: string;
  }
> = {
  yes: {
    wrap: {
      subtle:
        "bg-emerald-50 text-emerald-900 border-emerald-200 ring-emerald-600/10",
      outline:
        "bg-white text-emerald-900 border-emerald-300 ring-emerald-600/10",
    },
    iconWrap: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: "text-emerald-700",
  },
  no: {
    wrap: {
      subtle: "bg-rose-50 text-rose-900 border-rose-200 ring-rose-600/10",
      outline: "bg-white text-rose-900 border-rose-300 ring-rose-600/10",
    },
    iconWrap: "bg-rose-100 text-rose-700 border-rose-200",
    icon: "text-rose-700",
  },
  neutral: {
    wrap: {
      subtle: "bg-slate-50 text-slate-900 border-slate-200 ring-slate-600/10",
      outline: "bg-white text-slate-900 border-slate-300 ring-slate-600/10",
    },
    iconWrap: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "text-slate-700",
  },
};

const sizes: Record<
  Size,
  { pad: string; text: string; icon: string; gap: string }
> = {
  sm: { pad: "p-1", text: "text-xs", icon: "h-4 w-4", gap: "gap-2" },
  md: { pad: "p-3", text: "text-base", icon: "h-5 w-5", gap: "gap-3" },
};

interface JudgementProps {
  judgement: JudgementValue;
  size?: Size;
  className?: string;
  isSocialIssue?: boolean;
  onlySingleIssueVarying?: boolean;
}

function verdictCopy(
  j: JudgementValue,
  isSocialIssue?: boolean,
  onlySingleIssueVarying?: boolean,
) {
  if (isSocialIssue) {
    return "Neutral";
  }
  if (onlySingleIssueVarying) {
    return "Neutral";
  }
  switch (j) {
    case "yes":
      return "Vote Yes";
    case "no":
      return "Vote No";
    default:
      return "Neutral";
  }
}

export function Judgement({
  judgement,
  size = "sm",
  className,
  isSocialIssue,
  onlySingleIssueVarying,
}: JudgementProps) {
  const effectiveJudgement =
    isSocialIssue || onlySingleIssueVarying ? "neutral" : judgement;
  const s = stylesByJudgement[effectiveJudgement];
  const sz = sizes[size];

  const Icon =
    effectiveJudgement === "yes"
      ? CheckCircle2
      : effectiveJudgement === "no"
        ? XCircle
        : CircleMinus;

  return (
    <article
      role="status"
      aria-live="polite"
      className={["border-1 rounded-full w-fit px-2", sz.pad, className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={`flex items-center ${sz.gap}`}>
        <span
          className={[
            "inline-flex items-center justify-center rounded-full border ",
            sz.icon,
            s.iconWrap,
          ].join(" ")}
          aria-hidden="true"
        >
          <Icon className={`${sz.icon} ${s.icon}`} />
        </span>

        <span className={`font-medium leading-none ${sz.text}`}>
          {verdictCopy(
            effectiveJudgement,
            isSocialIssue,
            onlySingleIssueVarying,
          )}
        </span>
      </div>
    </article>
  );
}

export type { JudgementProps };
