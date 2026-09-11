import type { Metadata } from "next";
import { Suspense } from "react";
import { CollegeExplorer } from "@/components/college/college-explorer";
import { ListingSkeleton } from "@/components/college/listing-skeleton";
import { Container } from "@/components/layout/container";
import type { InitialCollegePage } from "@/hooks/use-colleges";
import { filtersToQueryString } from "@/lib/college-query";
import { PAGE_SIZE } from "@/lib/constants";
import { collegeListQuerySchema, searchParamsToObject } from "@/lib/validations/colleges";
import { getFilterOptions, listColleges } from "@/server/colleges";

export const metadata: Metadata = {
  title: "Colleges",
  description: "Search and filter 200 colleges by state, course, fees, rating, entrance exam and ownership.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CollegesPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    for (const item of Array.isArray(value) ? value : value ? [value] : []) params.append(key, item);
  }

  // Render the first page on the server so the list is there on first paint.
  // An invalid URL renders without it; the client then shows the API's 400 message.
  const parsed = collegeListQuerySchema.safeParse(searchParamsToObject(params));
  const [options, initial] = await Promise.all([
    getFilterOptions(),
    parsed.success
      ? listColleges({ ...parsed.data, cursor: undefined, limit: PAGE_SIZE }).then(
          ({ items, meta }): InitialCollegePage => ({
            queryString: filtersToQueryString(parsed.data),
            page: { data: items, meta },
          }),
        )
      : Promise.resolve(null),
  ]);

  return (
    <Container className="py-8">
      <Suspense fallback={<ListingSkeleton />}>
        <CollegeExplorer options={options} initial={initial} />
      </Suspense>
    </Container>
  );
}
