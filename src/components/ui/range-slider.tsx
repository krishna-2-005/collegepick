"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type Range = [min: number, max: number];

type RangeSliderProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: Range;
  onValueChange: (value: Range) => void;
  /** Formats values for display and screen readers. */
  format?: (value: number) => string;
  /** Accessible names for the two thumbs. */
  thumbLabels?: [string, string];
  className?: string;
};

/** Dual-thumb slider built from two native range inputs, so keyboard and screen readers work natively. */
export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onValueChange,
  format = String,
  thumbLabels = ["Minimum", "Maximum"],
  className,
}: RangeSliderProps) {
  const labelId = useId();
  const [low, high] = value;
  const span = max - min || 1;
  const lowPct = ((low - min) / span) * 100;
  const highPct = ((high - min) / span) * 100;
  // When both thumbs sit at the right end, the low thumb must be on top or it can't be dragged.
  const lowOnTop = low > min + span / 2;

  return (
    <div role="group" aria-labelledby={labelId} className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span id={labelId} className="text-sm font-medium text-ink">
          {label}
        </span>
        <span className="text-sm text-ink" aria-hidden>
          {format(low)} – {format(high)}
        </span>
      </div>
      <div className="relative h-10">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />
        <input
          type="range"
          className="range-input"
          style={{ zIndex: lowOnTop ? 3 : 2 }}
          min={min}
          max={max}
          step={step}
          value={low}
          aria-label={thumbLabels[0]}
          aria-valuetext={format(low)}
          onChange={(event) => onValueChange([Math.min(Number(event.target.value), high), high])}
        />
        <input
          type="range"
          className="range-input"
          style={{ zIndex: lowOnTop ? 2 : 3 }}
          min={min}
          max={max}
          step={step}
          value={high}
          aria-label={thumbLabels[1]}
          aria-valuetext={format(high)}
          onChange={(event) => onValueChange([low, Math.max(Number(event.target.value), low)])}
        />
      </div>
      <div className="flex justify-between text-xs text-ink-muted" aria-hidden>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
