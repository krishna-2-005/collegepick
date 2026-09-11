"use client";

import { Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { DEGREE_LABELS, MAX_COMPARE, OWNERSHIP_LABELS } from "@/lib/constants";
import { formatCount, formatFeeRange, formatLPA, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CompareCollege } from "@/types/college";

type Row = {
  label: string;
  render: (college: CompareCollege) => ReactNode;
  /** Numeric value for "best in row"; null when unknown. */
  value?: (college: CompareCollege) => number | null;
  better?: "high" | "low";
};

const notReported = <span className="text-ink-muted">Not reported</span>;

const ROWS: Row[] = [
  { label: "Location", render: (c) => `${c.city}, ${c.state}` },
  { label: "Ownership", render: (c) => OWNERSHIP_LABELS[c.ownership] },
  {
    label: "Rating",
    render: (c) => <StarRating value={c.rating} count={c.ratingCount} size="sm" />,
    value: (c) => c.rating,
    better: "high",
  },
  {
    label: "Fees per year",
    render: (c) => formatFeeRange(c.minFees, c.maxFees),
    value: (c) => c.minFees,
    better: "low",
  },
  {
    label: "Average package",
    render: (c) => (c.placement ? formatLPA(c.placement.avgPackageLPA) : notReported),
    value: (c) => c.placement?.avgPackageLPA ?? null,
    better: "high",
  },
  {
    label: "Median package",
    render: (c) => (c.placement ? formatLPA(c.placement.medianPackageLPA) : notReported),
    value: (c) => c.placement?.medianPackageLPA ?? null,
    better: "high",
  },
  {
    label: "Highest package",
    render: (c) => (c.placement ? formatLPA(c.placement.highestPackageLPA) : notReported),
    value: (c) => c.placement?.highestPackageLPA ?? null,
    better: "high",
  },
  {
    label: "Students placed",
    render: (c) => (c.placement ? formatPercent(c.placement.placementRate) : notReported),
    value: (c) => c.placement?.placementRate ?? null,
    better: "high",
  },
  {
    label: "NIRF rank",
    render: (c) => (c.nirfRank ? `#${c.nirfRank}` : <span className="text-ink-muted">Not ranked</span>),
    value: (c) => c.nirfRank,
    better: "low",
  },
  { label: "Established", render: (c) => String(c.establishedYear) },
  {
    label: "Degrees",
    render: (c) => c.degrees.map((degree) => DEGREE_LABELS[degree]).join(", "),
  },
  {
    label: "Programmes",
    render: (c) => formatCount(c.courseCount),
  },
  {
    label: "Top recruiters",
    render: (c) =>
      c.placement && c.placement.topRecruiters.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {c.placement.topRecruiters.slice(0, 6).map((recruiter) => (
            <li key={recruiter}>
              <Badge className="text-ink">{recruiter}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        notReported
      ),
  },
];

/**
 * Indexes holding the best value. Empty when fewer than two values are known
 * or when every value is the same: a "best" that everyone shares means nothing.
 */
export function bestIndexes(values: (number | null)[], better: "high" | "low"): Set<number> {
  const known = values.flatMap((value, index) => (value === null ? [] : [{ value, index }]));
  if (known.length < 2) return new Set();
  const target = better === "high" ? Math.max(...known.map((k) => k.value)) : Math.min(...known.map((k) => k.value));
  if (known.every((k) => k.value === target)) return new Set();
  return new Set(known.filter((k) => k.value === target).map((k) => k.index));
}

type CompareTableProps = {
  colleges: CompareCollege[];
  onRemove: (slug: string) => void;
  onAdd: () => void;
};

export function CompareTable({ colleges, onRemove, onAdd }: CompareTableProps) {
  const canAdd = colleges.length < MAX_COMPARE;
  const columns = colleges.length + (canAdd ? 1 : 0);

  return (
    <div className="overflow-x-auto rounded-panel border border-line bg-surface p-2 md:overflow-visible">
      <table className="w-full min-w-[660px] table-fixed border-separate border-spacing-0 text-[0.9375rem]">
        <caption className="sr-only">Side-by-side comparison of {colleges.map((c) => c.name).join(", ")}</caption>
        <colgroup>
          <col className="w-36 md:w-44" />
          {Array.from({ length: columns }, (_, index) => (
            <col key={index} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-20 bg-surface md:top-16">
              <span className="sr-only">Attribute</span>
            </th>
            {colleges.map((college) => (
              <th key={college.slug} scope="col" className="bg-surface p-3 text-left align-top font-normal md:sticky md:top-16 md:z-10">
                <div className="flex items-start gap-3">
                  <span className="relative hidden size-12 shrink-0 overflow-hidden rounded-control bg-line sm:block">
                    <Image src={college.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/colleges/${college.slug}`} className="font-display text-base leading-snug font-bold text-ink hover:underline">
                      {college.name}
                    </Link>
                    <span className="text-sm text-ink-muted">{college.city}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(college.slug)}
                    aria-label={`Remove ${college.name} from comparison`}
                    className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-line/60 hover:text-ink"
                  >
                    <X aria-hidden className="size-4.5" />
                  </button>
                </div>
              </th>
            ))}
            {canAdd ? (
              <th scope="col" className="bg-surface p-3 align-top md:sticky md:top-16 md:z-10">
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex h-full min-h-16 w-full items-center justify-center gap-2 rounded-card border border-line text-sm font-medium text-accent hover:border-accent hover:bg-accent-soft"
                >
                  <Plus aria-hidden className="size-4.5" />
                  Add college
                </button>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const best = row.value && row.better ? bestIndexes(colleges.map(row.value), row.better) : new Set<number>();
            return (
              <tr key={row.label}>
                <th scope="row" className="sticky left-0 z-10 border-t border-line bg-surface p-3 text-left align-top text-sm font-medium text-ink-muted">
                  {row.label}
                </th>
                {colleges.map((college, index) => (
                  <td
                    key={college.slug}
                    className={cn("border-t border-line p-3 align-top", best.has(index) && "font-semibold text-good")}
                  >
                    <span className="inline-flex flex-wrap items-center gap-x-2">
                      {row.render(college)}
                      {best.has(index) ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-good">
                          <span aria-hidden className="size-1.5 rounded-full bg-good" />
                          Best
                        </span>
                      ) : null}
                    </span>
                  </td>
                ))}
                {canAdd ? <td className="border-t border-line" /> : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
