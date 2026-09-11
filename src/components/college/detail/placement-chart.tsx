"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { formatLPA } from "@/lib/format";
import { tokens } from "@/lib/tokens";
import type { PlacementData } from "@/types/college";

/** Average, median and highest package as bars. Chart animation is off (motion policy). */
export function PlacementChart({ placement }: { placement: PlacementData }) {
  const data = [
    { label: "Average", value: placement.avgPackageLPA },
    { label: "Median", value: placement.medianPackageLPA },
    { label: "Highest", value: placement.highestPackageLPA },
  ];

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="text-sm text-ink-muted">Package in lakhs per year, {placement.year} season</figcaption>
      <div className="h-60" role="img" aria-label={data.map((row) => `${row.label} ${formatLPA(row.value)}`).join(", ")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 28, right: 8, bottom: 0, left: 8 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke={tokens.line} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: tokens.line }}
              tick={{ fill: tokens.inkMuted, fontSize: 13 }}
            />
            <YAxis hide domain={[0, "dataMax"]} />
            <Bar dataKey="value" fill={tokens.accent} radius={[6, 6, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value) => formatLPA(Number(value))}
                style={{ fill: tokens.ink, fontSize: 14, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
