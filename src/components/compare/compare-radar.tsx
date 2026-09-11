"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { tokens } from "@/lib/tokens";
import type { CompareCollege } from "@/types/college";

export const SERIES_COLORS = [tokens.accent, tokens.ink, tokens.inkMuted] as const;

/**
 * Four metrics on a 0–100 scale relative to the colleges shown: rating (out of 5),
 * affordability (cheapest fee = 100), average package (highest = 100), placement rate.
 */
export function CompareRadar({ colleges }: { colleges: CompareCollege[] }) {
  const cheapest = Math.min(...colleges.map((c) => c.minFees));
  const topPackage = Math.max(...colleges.map((c) => c.placement?.avgPackageLPA ?? 0), 1);

  const metrics = [
    { metric: "Rating", score: (c: CompareCollege) => (c.rating / 5) * 100 },
    { metric: "Affordability", score: (c: CompareCollege) => (cheapest / Math.max(c.minFees, 1)) * 100 },
    { metric: "Avg package", score: (c: CompareCollege) => ((c.placement?.avgPackageLPA ?? 0) / topPackage) * 100 },
    { metric: "Placed", score: (c: CompareCollege) => c.placement?.placementRate ?? 0 },
  ];
  const data = metrics.map(({ metric, score }) => ({
    metric,
    ...Object.fromEntries(colleges.map((college) => [college.slug, Math.round(score(college))])),
  }));

  return (
    <figure className="flex flex-col gap-4">
      <div className="h-72" role="img" aria-label={`Radar chart comparing ${colleges.map((c) => c.name).join(", ")} on rating, affordability, average package and placement rate.`}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke={tokens.line} />
            <PolarAngleAxis dataKey="metric" tick={{ fill: tokens.inkMuted, fontSize: 13 }} />
            {colleges.map((college, index) => (
              <Radar
                key={college.slug}
                name={college.name}
                dataKey={college.slug}
                stroke={SERIES_COLORS[index]}
                strokeWidth={2}
                strokeDasharray={index === 2 ? "5 4" : undefined}
                fill={SERIES_COLORS[index]}
                fillOpacity={index === 0 ? 0.14 : 0.06}
                isAnimationActive={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <figcaption>
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          {colleges.map((college, index) => (
            <li key={college.slug} className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-0.5 w-5"
                style={{
                  backgroundColor: index === 2 ? "transparent" : SERIES_COLORS[index],
                  borderTop: index === 2 ? `2px dashed ${SERIES_COLORS[index]}` : undefined,
                }}
              />
              {college.name}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-center text-xs text-ink-muted">
          Scores are relative to the colleges shown. Affordability: the cheapest scores 100.
        </p>
      </figcaption>
    </figure>
  );
}
