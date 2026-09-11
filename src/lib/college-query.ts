import type { DegreeValue, ExamValue, OwnershipValue, SortValue } from "@/lib/constants";

export type ListFilters = {
  q?: string;
  state?: string[];
  city?: string;
  course?: DegreeValue[];
  exam?: ExamValue[];
  ownership?: OwnershipValue[];
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  sort: SortValue;
};

/**
 * Canonical query string for a filter set: fixed key order, sorted arrays, empty
 * values dropped. The server page and the client hook both use it, so the first
 * page rendered on the server is reused as the client cache entry for that URL.
 */
export function filtersToQueryString(filters: ListFilters): string {
  const params = new URLSearchParams();
  const q = filters.q?.trim();
  if (q) params.set("q", q);
  for (const key of ["state", "course", "exam", "ownership"] as const) {
    const values = filters[key];
    if (values && values.length > 0) params.set(key, [...values].sort().join(","));
  }
  if (filters.city) params.set("city", filters.city);
  if (filters.minFees !== undefined) params.set("minFees", String(filters.minFees));
  if (filters.maxFees !== undefined) params.set("maxFees", String(filters.maxFees));
  if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
  params.set("sort", filters.sort);
  return params.toString();
}
