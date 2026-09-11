"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { PAGE_SIZE } from "@/lib/constants";
import type { CollegeCardData, CollegeListMeta } from "@/types/college";

export type CollegePage = { data: CollegeCardData[]; meta: CollegeListMeta };
export type InitialCollegePage = { queryString: string; page: CollegePage };

/**
 * Infinite list keyed by the canonical query string. While new filters load, the
 * previous results stay on screen (keepPreviousData) so the page never collapses.
 */
export function useColleges(queryString: string, initial?: InitialCollegePage | null) {
  return useInfiniteQuery({
    queryKey: ["colleges", queryString],
    queryFn: ({ pageParam, signal }) => {
      const cursor = pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : "";
      return apiFetch<CollegeCardData[], CollegeListMeta>(`/api/colleges?${queryString}&limit=${PAGE_SIZE}${cursor}`, {
        signal,
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last: CollegePage) => last.meta.nextCursor,
    initialData:
      initial && initial.queryString === queryString ? { pages: [initial.page], pageParams: [null] } : undefined,
    placeholderData: keepPreviousData,
  });
}
