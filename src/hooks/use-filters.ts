"use client";

import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";
import { filtersToQueryString, type ListFilters } from "@/lib/college-query";
import { DEGREES, EXAMS, OWNERSHIPS, SORTS } from "@/lib/constants";

export const filterParsers = {
  q: parseAsString.withDefault(""),
  state: parseAsArrayOf(parseAsString).withDefault([]),
  city: parseAsString.withDefault(""),
  course: parseAsArrayOf(parseAsStringLiteral(DEGREES)).withDefault([]),
  exam: parseAsArrayOf(parseAsStringLiteral(EXAMS)).withDefault([]),
  ownership: parseAsArrayOf(parseAsStringLiteral(OWNERSHIPS)).withDefault([]),
  minFees: parseAsInteger,
  maxFees: parseAsInteger,
  minRating: parseAsFloat,
  sort: parseAsStringLiteral(SORTS).withDefault("rating"),
};

/**
 * Listing filters live in the URL: shareable, bookmarkable, and the back button
 * steps through filter changes. Shallow updates, so only the client refetches.
 */
export function useCollegeFilters() {
  const [filters, setFilters] = useQueryStates(filterParsers, { history: "push", shallow: true, scroll: false });

  const listFilters: ListFilters = useMemo(
    () => ({
      q: filters.q || undefined,
      state: filters.state,
      city: filters.city || undefined,
      course: filters.course,
      exam: filters.exam,
      ownership: filters.ownership,
      minFees: filters.minFees ?? undefined,
      maxFees: filters.maxFees ?? undefined,
      minRating: filters.minRating ?? undefined,
      sort: filters.sort,
    }),
    [filters],
  );

  const activeCount =
    (filters.q ? 1 : 0) +
    filters.state.length +
    (filters.city ? 1 : 0) +
    filters.course.length +
    filters.exam.length +
    filters.ownership.length +
    (filters.minFees !== null || filters.maxFees !== null ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0);

  const clearAll = useCallback(
    () =>
      setFilters({
        q: null,
        state: null,
        city: null,
        course: null,
        exam: null,
        ownership: null,
        minFees: null,
        maxFees: null,
        minRating: null,
      }),
    [setFilters],
  );

  return { filters, setFilters, listFilters, queryString: filtersToQueryString(listFilters), activeCount, clearAll };
}

export type CollegeFiltersState = ReturnType<typeof useCollegeFilters>;
