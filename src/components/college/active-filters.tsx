"use client";

import { Button } from "@/components/ui/button";
import { RemovableChip } from "@/components/ui/chip";
import type { CollegeFiltersState } from "@/hooks/use-filters";
import { DEGREE_LABELS, EXAM_LABELS, OWNERSHIP_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/format";

function feeLabel(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${formatINR(min)}–${formatINR(max).slice(1)}/yr`;
  if (max !== null) return `Under ${formatINR(max)}/yr`;
  return `Over ${formatINR(min ?? 0)}/yr`;
}

/** One removable chip per active filter, plus "Clear all". */
export function ActiveFilters({ state }: { state: CollegeFiltersState }) {
  const { filters, setFilters, clearAll, activeCount } = state;
  if (activeCount === 0) return null;

  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”`, remove: () => void setFilters({ q: null }) });
  for (const value of filters.state) {
    chips.push({
      key: `state-${value}`,
      label: value,
      remove: () => void setFilters({ state: filters.state.filter((item) => item !== value) }),
    });
  }
  if (filters.city) chips.push({ key: "city", label: filters.city, remove: () => void setFilters({ city: null }) });
  for (const value of filters.course) {
    chips.push({
      key: `course-${value}`,
      label: DEGREE_LABELS[value],
      remove: () => void setFilters({ course: filters.course.filter((item) => item !== value) }),
    });
  }
  if (filters.minFees !== null || filters.maxFees !== null) {
    chips.push({
      key: "fees",
      label: feeLabel(filters.minFees, filters.maxFees),
      remove: () => void setFilters({ minFees: null, maxFees: null }),
    });
  }
  if (filters.minRating !== null) {
    chips.push({ key: "rating", label: `${filters.minRating}+ stars`, remove: () => void setFilters({ minRating: null }) });
  }
  for (const value of filters.exam) {
    chips.push({
      key: `exam-${value}`,
      label: EXAM_LABELS[value],
      remove: () => void setFilters({ exam: filters.exam.filter((item) => item !== value) }),
    });
  }
  for (const value of filters.ownership) {
    chips.push({
      key: `ownership-${value}`,
      label: OWNERSHIP_LABELS[value],
      remove: () => void setFilters({ ownership: filters.ownership.filter((item) => item !== value) }),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters" role="group">
      {chips.map((chip) => (
        <RemovableChip key={chip.key} onRemove={chip.remove}>
          {chip.label}
        </RemovableChip>
      ))}
      <Button variant="ghost" size="sm" onClick={() => void clearAll()}>
        Clear all
      </Button>
    </div>
  );
}
