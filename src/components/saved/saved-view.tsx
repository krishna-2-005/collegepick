"use client";

import { GitCompareArrows, Heart, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { CollegeCard, CollegeCardSkeleton, CollegeGrid } from "@/components/college/college-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { useDeleteComparison, useSavedComparisons } from "@/hooks/use-saved-comparisons";
import { useSavedColleges } from "@/hooks/use-saved";
import { formatDate } from "@/lib/format";
import { compareHref } from "@/store/compare";

const tabParser = parseAsStringLiteral(["colleges", "comparisons"] as const).withDefault("colleges");

export function SavedView({ firstName }: { firstName: string }) {
  const [tab, setTab] = useQueryState("tab", tabParser.withOptions({ history: "replace", scroll: false }));
  const colleges = useSavedColleges();
  const comparisons = useSavedComparisons();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl">Saved</h1>
        <p className="text-ink-muted">
          {firstName ? `${firstName}, here's` : "Here's"} your shortlist. Tap the heart on a college to remove it.
        </p>
      </div>
      <Tabs
        label="Saved items"
        value={tab}
        onValueChange={(value) => void setTab(value as typeof tab)}
        items={[
          {
            value: "colleges",
            label: "Saved colleges",
            count: colleges.data?.length,
            content: <SavedColleges query={colleges} />,
          },
          {
            value: "comparisons",
            label: "Saved comparisons",
            count: comparisons.data?.length,
            content: <SavedComparisons query={comparisons} />,
          },
        ]}
      />
    </div>
  );
}

function SavedColleges({ query }: { query: ReturnType<typeof useSavedColleges> }) {
  if (query.isPending) {
    return (
      <CollegeGrid>
        {Array.from({ length: 3 }, (_, index) => (
          <CollegeCardSkeleton key={index} />
        ))}
      </CollegeGrid>
    );
  }
  if (query.isError) {
    return (
      <EmptyState
        icon={<TriangleAlert />}
        title="We couldn't load your saved colleges"
        description={query.error.message}
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
      />
    );
  }
  if (query.data.length === 0) {
    return (
      <EmptyState
        icon={<Heart />}
        title="No saved colleges yet"
        description="Tap the heart on any college to keep it here for later."
        action={<ButtonLink href="/colleges">Browse colleges</ButtonLink>}
      />
    );
  }
  return (
    <CollegeGrid>
      {query.data.map((college) => (
        <CollegeCard key={college.id} college={college} />
      ))}
    </CollegeGrid>
  );
}

function SavedComparisons({ query }: { query: ReturnType<typeof useSavedComparisons> }) {
  const remove = useDeleteComparison();

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
    );
  }
  if (query.isError) {
    return (
      <EmptyState
        icon={<TriangleAlert />}
        title="We couldn't load your saved comparisons"
        description={query.error.message}
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
      />
    );
  }
  if (query.data.length === 0) {
    return (
      <EmptyState
        icon={<GitCompareArrows />}
        title="No saved comparisons yet"
        description="Pick two or three colleges, compare them, then choose Save comparison."
        action={<ButtonLink href="/colleges">Browse colleges</ButtonLink>}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {query.data.map((comparison) => {
        const names = comparison.colleges.map((college) => college.shortName ?? college.name).join(" vs ");
        return (
          <li key={comparison.id}>
            <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex -space-x-2">
                {comparison.colleges.map((college) => (
                  <span key={college.id} className="relative size-11 overflow-hidden rounded-full border-2 border-surface bg-line">
                    <Image src={college.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="font-display text-lg font-bold">{comparison.name ?? names}</p>
                <p className="truncate text-sm text-ink-muted">
                  {comparison.colleges.map((college) => college.name).join(", ")}
                </p>
                <p className="text-sm text-ink-muted">Saved {formatDate(comparison.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                {comparison.colleges.length >= 2 ? (
                  <ButtonLink href={compareHref(comparison.colleges)} variant="secondary" size="sm">
                    Open
                  </ButtonLink>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-warn hover:bg-warn/10 hover:text-warn"
                  onClick={() => remove.mutate(comparison.id)}
                  aria-label={`Delete comparison: ${names}`}
                >
                  Delete
                </Button>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
