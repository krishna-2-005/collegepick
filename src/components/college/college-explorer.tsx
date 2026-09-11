"use client";

import { m, useReducedMotion } from "framer-motion";
import { SearchX, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { useColleges, type InitialCollegePage } from "@/hooks/use-colleges";
import { useCollegeFilters } from "@/hooks/use-filters";
import { ApiClientError } from "@/lib/api-client";
import { PAGE_SIZE, SORTS, SORT_LABELS, type SortValue } from "@/lib/constants";
import { formatCount } from "@/lib/format";
import type { FilterOptions } from "@/types/college";
import { ActiveFilters } from "./active-filters";
import { CollegeCard, CollegeCardSkeleton, CollegeGrid } from "./college-card";
import { FilterPanel } from "./filter-panel";

const sortOptions = SORTS.map((value) => ({ value, label: SORT_LABELS[value] }));

type CollegeExplorerProps = {
  options: FilterOptions;
  initial: InitialCollegePage | null;
};

export function CollegeExplorer({ options, initial }: CollegeExplorerProps) {
  const filterState = useCollegeFilters();
  const { filters, setFilters, queryString, activeCount, clearAll } = filterState;
  const query = useColleges(queryString, initial);
  const reduceMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The key of the data on screen: while new filters load, the old list (and its key) stays.
  const settledKey = useRef(queryString);
  if (!query.isPlaceholderData && query.data) settledKey.current = queryString;

  const colleges = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.meta.total;
  const remaining = total !== undefined ? total - colleges.length : 0;
  const updating = query.isFetching && !query.isFetchingNextPage;

  const countText =
    total === undefined ? "Loading colleges…" : `${formatCount(total)} ${total === 1 ? "college" : "colleges"}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-2 pb-6">
          <FilterPanel options={options} state={filterState} />
        </div>
      </aside>

      <section aria-labelledby="results-heading" className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 id="results-heading" className="text-2xl md:text-3xl">
              Colleges
            </h1>
            <p className="text-ink-muted" role="status" aria-live="polite">
              {countText}
            </p>
          </div>
          <div className="flex w-full items-end gap-2 sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 lg:hidden"
              icon={<SlidersHorizontal aria-hidden className="size-4.5" />}
              onClick={() => setDrawerOpen(true)}
            >
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>
            <Select
              label="Sort by"
              hideLabel
              options={sortOptions}
              value={filters.sort}
              onChange={(event) => void setFilters({ sort: event.target.value as SortValue })}
              containerClassName="flex-1 sm:w-56 sm:flex-none"
            />
          </div>
        </div>

        <ActiveFilters state={filterState} />

        {query.isError && colleges.length === 0 ? (
          <EmptyState
            icon={<TriangleAlert />}
            title="We couldn't load colleges"
            description={
              query.error instanceof ApiClientError && query.error.details?.[0]
                ? `This link has a filter we can't use: ${query.error.details[0].message} Clear filters to start again.`
                : query.error.message
            }
            action={
              <>
                <Button onClick={() => void query.refetch()}>Try again</Button>
                {activeCount > 0 ? (
                  <Button variant="secondary" onClick={() => void clearAll()}>
                    Clear filters
                  </Button>
                ) : null}
              </>
            }
          />
        ) : total === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title="No colleges match"
            description="Clear filters or widen the fee range."
            action={
              <Button variant="secondary" onClick={() => void clearAll()}>
                Clear filters
              </Button>
            }
          />
        ) : colleges.length === 0 ? (
          <CollegeGrid className="lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <CollegeCardSkeleton key={index} />
            ))}
          </CollegeGrid>
        ) : (
          // Motion #2 of 3: a 150ms fade when a new result set replaces the old one.
          <m.div
            key={settledKey.current}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            aria-busy={updating}
          >
            <CollegeGrid className="lg:grid-cols-2 xl:grid-cols-3">
              {colleges.map((college, index) => (
                <CollegeCard key={college.id} college={college} priority={index < 3} />
              ))}
            </CollegeGrid>
          </m.div>
        )}

        {query.hasNextPage ? (
          <div className="flex flex-col items-center gap-2 pt-4">
            <p className="text-sm text-ink-muted">
              Showing {formatCount(colleges.length)} of {formatCount(total ?? 0)}
            </p>
            <Button
              variant="secondary"
              loading={query.isFetchingNextPage}
              loadingText="Loading more…"
              onClick={() => void query.fetchNextPage()}
            >
              Load {Math.min(PAGE_SIZE, remaining)} more
            </Button>
            {query.isFetchNextPageError ? (
              <p className="text-sm text-warn" role="alert">
                {query.error?.message} Try again.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Filters"
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => void clearAll()} disabled={activeCount === 0}>
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => setDrawerOpen(false)}>
              {total === undefined ? "Show colleges" : `Show ${formatCount(total)} ${total === 1 ? "college" : "colleges"}`}
            </Button>
          </>
        }
      >
        <FilterPanel options={options} state={filterState} />
      </Drawer>
    </div>
  );
}
