"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/** Recharts is ~100 kB; load it only when the placements section renders on the client. */
export const PlacementChartLazy = dynamic(() => import("./placement-chart").then((mod) => mod.PlacementChart), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-60 w-full" />
    </div>
  ),
});
