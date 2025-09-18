import { CheckCircle2, XCircle, CircleHelp } from "lucide-react";
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

function verdictCopy(j: JudgementValue, isSocialIssue?: boolean) {
  if (isSocialIssue) {
    return "We are neutral on this bill.";
  }
  switch (j) {
    case "yes":
      return "We would vote for this.";
    case "no":
      return "We wouldn’t vote for this.";
    default:
      return "We are neutral on this bill.";
  }
}

export function Judgement({
  judgement,
  size = "sm",
  className,
  isSocialIssue,
}: {
  judgement: JudgementValue;
  size?: Size;
  className?: string;
  isSocialIssue?: boolean;
}) {
  const s = isSocialIssue
    ? stylesByJudgement.neutral
    : stylesByJudgement[judgement];
  const sz = sizes[size];

  const Icon = isSocialIssue
    ? CircleHelp
    : judgement === "yes"
      ? CheckCircle2
      : judgement === "no"
        ? XCircle
        : CircleHelp;

  return (
    <article
      role="status"
      aria-live="polite"
      className={[
        "border-1 rounded-full w-fit",
        // "w-fit rounded-xl border-2 ring-1 transition-all duration-200 hover:shadow-lg",
        // "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        // s.wrap[variant],
        sz.pad,
        className,
      ].join(" ")}
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
          <Icon
            className={
              sz.icon +
              " " +
              s.icon +
              " " +
              (isSocialIssue ? "text-slate-700" : "")
            }
          />
        </span>

        <span className={`font-medium leading-none ${sz.text}`}>
          {verdictCopy(judgement, isSocialIssue)}
        </span>
        {/* <div className="flex flex-col">
          {showLabel && (
          )}
          <span className={`${sz.text}`}>
            {verdictCopy(judgement)}
          </span>
        </div> */}
      </div>
    </article>
  );
}
