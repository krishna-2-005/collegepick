import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatBlockProps = {
  label: string;
  value: ReactNode;
  /** Small muted line under the label, e.g. "2024 batch". */
  hint?: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "good" | "warn";
  className?: string;
};

const valueSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const tones = {
  default: "text-ink",
  good: "text-good",
  warn: "text-warn",
};

/**
 * Big number over a muted label. The label comes first in the DOM so screen
 * readers say "Average package, 8.5 LPA"; flex-col-reverse puts the value on top.
 */
export function StatBlock({ label, value, hint, size = "md", tone = "default", className }: StatBlockProps) {
  return (
    <div className={cn("flex flex-col-reverse gap-0.5", className)}>
      <div className="flex flex-col">
        <span className="text-sm text-ink-muted">{label}</span>
        {hint ? <span className="text-xs text-ink-muted">{hint}</span> : null}
      </div>
      <span className={cn("leading-tight font-semibold tracking-tight", valueSizes[size], tones[tone])}>
        {value}
      </span>
    </div>
  );
}
