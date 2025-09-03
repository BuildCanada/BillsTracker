import React from "react";
import clsx from "clsx";

interface VoteBadgeProps {
  vote: "yes" | "no" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** 0 = off, higher = more ink wobble */
  inkIntensity?: number; // default 1.2
}

export const VoteBadge = ({
  vote,
  size = "lg",
  className,
  inkIntensity = 1.2,
}: VoteBadgeProps) => {
  const theme = {
    yes: { stroke: "stroke-emerald-800", fill: "fill-emerald-800" },
    no: { stroke: "stroke-rose-800", fill: "fill-rose-800" },
    neutral: { stroke: "stroke-slate-800", fill: "fill-slate-800" },
  }[vote];

  const ringTop =
    vote === "yes" ? "SUPPORTS" : vote === "no" ? "OPPOSES" : "NEUTRAL";
  const ringBottom = "BUILD CANADA";

  // Center stack (match the postmark’s 3 lines)
  const centerTop = vote === "yes" ? "YES" : vote === "no" ? "NO" : "NEUTRAL";
  const centerMid = "12–6";
  const centerBot = "1955";

  const dims =
    size === "sm"
      ? { px: 72, strokeW: 6, ringSize: "text-[12px]", midSize: "text-[16px]", botSize: "text-[18px]" }
      : size === "lg"
        ? { px: 144, strokeW: 8, ringSize: "text-lg", midSize: "text-2xl", botSize: "text-3xl" }
        : { px: 104, strokeW: 7, ringSize: "text-[14px]", midSize: "text-[18px]", botSize: "text-[20px]" };

  const view = 200;
  const r = 86;
  const cx = 100, cy = 100;

  // Scale displacement a bit with size
  const scale =
    (size === "sm" ? 1.0 : size === "lg" ? 1.6 : 1.2) * inkIntensity;

  return (
    <div
      className={clsx("inline-block select-none", className)}
      style={{ width: dims.px, height: dims.px }}
    >
      <svg viewBox={`0 0 ${view} ${view}`} className="rotate-12" aria-hidden>
        <defs>
          {/* Curved text guides */}
          <path id="arc-top" d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} />
          <path id="arc-bot" d={`M ${cx + r},${cy} A ${r},${r} 0 0 1 ${cx - r},${cy}`} />

          {/* Ink wobble without overlay:
              - feTurbulence generates noise
              - feDisplacementMap warps only the source graphics
              - tiny blur softens the edges
              Note: filter area slightly larger to avoid clipping */}
          <filter
            id="stampInk"
            x="-8%" y="-8%" width="116%" height="116%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.018"  /* lower = larger blotches */
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              xChannelSelector="R"
              yChannelSelector="G"
              scale={scale}          /* <- tweak this */
            />
            <feGaussianBlur stdDeviation="0.18" />
          </filter>
        </defs>

        {/* Outer ring */}
        <g className={theme.stroke} filter="url(#stampInk)">
          <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={dims.strokeW} />
        </g>

        {/* Curved ring text */}
        <g className={theme.fill} filter="url(#stampInk)">
          <text
            className={clsx("font-black uppercase tracking-[0.15em]", dims.ringSize)}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontWeight: 900 }}
          >
            <textPath href="#arc-top" startOffset="50%">{ringTop}</textPath>
          </text>

          <text
            className={clsx("font-black uppercase tracking-[0.15em]", dims.ringSize)}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontWeight: 900 }}
          >
            <textPath href="#arc-bot" startOffset="50%">{ringBottom}</textPath>
          </text>
        </g>

        {/* Center stack */}
        <g className={theme.fill} filter="url(#stampInk)">
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            className={clsx("font-black uppercase tracking-[0.12em]", dims.midSize)}
            style={{ fontWeight: 900 }}
          >
            {centerTop}
          </text>
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            className={clsx("font-black tracking-[0.16em]", dims.midSize)}
            style={{ fontWeight: 900 }}
          >
            {centerMid}
          </text>
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            className={clsx("font-black tracking-[0.16em]", dims.botSize)}
            style={{ fontWeight: 900 }}
          >
            {centerBot}
          </text>
        </g>
      </svg>
    </div>
  );
};