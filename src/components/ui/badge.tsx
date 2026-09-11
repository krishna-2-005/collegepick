import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "good" | "warn" | "solid";

const tones: Record<BadgeTone, string> = {
  neutral: "border border-line bg-bg text-ink-muted",
  accent: "bg-accent-soft text-accent-strong",
  // Strong shades: the base tokens on their own 10% tint fall just under 4.5:1.
  good: "bg-good/10 text-good-strong",
  warn: "bg-warn/10 text-warn-strong",
  solid: "bg-accent text-white",
};

type BadgeProps = {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
};

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-control px-2 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
