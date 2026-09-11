"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { RangeSlider, type Range } from "@/components/ui/range-slider";
import { Select } from "@/components/ui/select";
import type { CollegeFiltersState } from "@/hooks/use-filters";
import { RATING_OPTIONS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import type { FilterOptions } from "@/types/college";

const DEBOUNCE_MS = 300;
const FEE_STEP = 50_000;

type FilterPanelProps = {
  options: FilterOptions;
  state: CollegeFiltersState;
};

export function FilterPanel({ options, state }: FilterPanelProps) {
  const { filters, setFilters } = state;

  function toggleIn<T extends string>(list: T[], value: T, on: boolean): T[] | null {
    const next = on ? [...list, value] : list.filter((item) => item !== value);
    return next.length > 0 ? next : null;
  }

  const cities = options.cities.filter(
    (city) => filters.state.length === 0 || filters.state.includes(city.state),
  );
  const cityOptions = [...new Map(cities.map((city) => [city.value, { value: city.value, label: city.value }])).values()];

  return (
    <div className="flex flex-col">
      <SearchWithin value={filters.q} onCommit={(q) => void setFilters({ q: q || null }, { history: "replace" })} />

      <Group legend="State">
        <div className="flex flex-wrap gap-2">
          {options.states.map((option) => (
            <Chip
              key={option.value}
              selected={filters.state.includes(option.value)}
              onSelectedChange={(on) => {
                const state = toggleIn(filters.state, option.value, on);
                // Drop a city that no longer belongs to the selected states.
                const cityStillValid =
                  !filters.city ||
                  !state ||
                  options.cities.some((city) => city.value === filters.city && state.includes(city.state));
                void setFilters({ state, ...(cityStillValid ? {} : { city: null }) });
              }}
            >
              {option.value}
            </Chip>
          ))}
        </div>
      </Group>

      <Group legend="City" asFieldset={false}>
        <Select
          label="City"
          hideLabel
          placeholder="Any city"
          options={cityOptions}
          value={filters.city}
          onChange={(event) => void setFilters({ city: event.target.value || null })}
        />
      </Group>

      <Group legend="Course">
        <div className="flex flex-wrap gap-2">
          {options.courses.map((option) => (
            <Chip
              key={option.value}
              selected={filters.course.includes(option.value)}
              onSelectedChange={(on) => void setFilters({ course: toggleIn(filters.course, option.value, on) })}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </Group>

      {/* The slider labels itself ("Fees per year" plus the current range). */}
      <div className="border-t border-line py-5">
        <FeeRange
          bounds={options.fees}
          min={filters.minFees}
          max={filters.maxFees}
          onCommit={(minFees, maxFees) => void setFilters({ minFees, maxFees })}
        />
      </div>

      <Group legend="Rating">
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((value) => (
            <Chip
              key={value}
              selected={filters.minRating === value}
              onSelectedChange={(on) => void setFilters({ minRating: on ? value : null })}
            >
              {value}+ stars
            </Chip>
          ))}
        </div>
      </Group>

      <Group legend="Entrance exam">
        <div className="flex flex-wrap gap-2">
          {options.exams.map((option) => (
            <Chip
              key={option.value}
              selected={filters.exam.includes(option.value)}
              onSelectedChange={(on) => void setFilters({ exam: toggleIn(filters.exam, option.value, on) })}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group legend="Ownership">
        <div className="flex flex-wrap gap-2">
          {options.ownerships.map((option) => (
            <Chip
              key={option.value}
              selected={filters.ownership.includes(option.value)}
              onSelectedChange={(on) => void setFilters({ ownership: toggleIn(filters.ownership, option.value, on) })}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </Group>
    </div>
  );
}

function Group({ legend, children, asFieldset = true }: { legend: string; children: ReactNode; asFieldset?: boolean }) {
  const heading = "mb-3 text-sm font-medium text-ink";
  if (!asFieldset) {
    return (
      <div className="border-t border-line py-5">
        <p className={heading}>{legend}</p>
        {children}
      </div>
    );
  }
  return (
    <fieldset className="border-t border-line py-5">
      <legend className={`float-left w-full ${heading}`}>{legend}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

/** Latest callback in a ref, so a new function each render doesn't restart a debounce. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** Typing is local; the URL updates 300ms after the last keystroke. */
function SearchWithin({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {
  const [local, setLocal] = useState(value);
  const lastSent = useRef(value);
  const commit = useLatest(onCommit);

  // Sync when the URL changes from elsewhere (Clear all, back button), not from our own commits.
  useEffect(() => {
    if (value !== lastSent.current) {
      lastSent.current = value;
      setLocal(value);
    }
  }, [value]);

  useEffect(() => {
    if (local.trim() === lastSent.current) return;
    const timer = window.setTimeout(() => {
      lastSent.current = local.trim();
      commit.current(local.trim());
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [local, commit]);

  return (
    <div className="pb-5">
      <Input
        label="Search within results"
        placeholder="Name, city or course"
        icon={<Search aria-hidden />}
        value={local}
        onChange={(event) => setLocal(event.target.value)}
        type="search"
      />
    </div>
  );
}

function FeeRange({
  bounds,
  min,
  max,
  onCommit,
}: {
  bounds: { min: number; max: number };
  min: number | null;
  max: number | null;
  onCommit: (min: number | null, max: number | null) => void;
}) {
  const floor = 0;
  const ceiling = Math.ceil(bounds.max / FEE_STEP) * FEE_STEP;
  const fromUrl: Range = [min ?? floor, max ?? ceiling];
  const [local, setLocal] = useState<Range>(fromUrl);
  const committed = useRef<Range>(fromUrl);
  const commit = useLatest(onCommit);

  useEffect(() => {
    const next: Range = [min ?? floor, max ?? ceiling];
    if (next[0] !== committed.current[0] || next[1] !== committed.current[1]) {
      committed.current = next;
      setLocal(next);
    }
  }, [min, max, ceiling]);

  useEffect(() => {
    if (local[0] === committed.current[0] && local[1] === committed.current[1]) return;
    const timer = window.setTimeout(() => {
      committed.current = local;
      // The full range means "no fee filter", so it leaves the URL clean.
      commit.current(local[0] > floor ? local[0] : null, local[1] < ceiling ? local[1] : null);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [local, ceiling, commit]);

  return (
    <RangeSlider
      label="Fees per year"
      min={floor}
      max={ceiling}
      step={FEE_STEP}
      value={local}
      onValueChange={setLocal}
      format={formatINR}
      thumbLabels={["Minimum fees per year", "Maximum fees per year"]}
    />
  );
}
