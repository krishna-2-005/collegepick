import { Skeleton } from "@/components/ui/skeleton";
import { CollegeCardSkeleton, CollegeGrid } from "./college-card";

/** Mirrors the listing layout: filter column plus a grid of card skeletons. */
export function ListingSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]" aria-busy="true" aria-label="Loading colleges">
      <div className="hidden flex-col gap-6 lg:flex">
        <Skeleton className="h-11" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 border-t border-line pt-5">
            <Skeleton className="h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>
        <CollegeGrid className="lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <CollegeCardSkeleton key={index} />
          ))}
        </CollegeGrid>
      </div>
    </div>
  );
}
