"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const CompareRadarLazy = dynamic(() => import("./compare-radar").then((mod) => mod.CompareRadar), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
});
