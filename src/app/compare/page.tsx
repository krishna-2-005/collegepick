import type { Metadata } from "next";
import { cache } from "react";
import { CompareView, type InitialCompare } from "@/components/compare/compare-view";
import { Container } from "@/components/layout/container";
import { ApiError } from "@/lib/api-response";
import { compareSlugsSchema, splitIds } from "@/lib/validations/saved";
import { getCollegesForCompare } from "@/server/colleges";

type SearchParams = Promise<{ ids?: string | string[] }>;

// Shared by generateMetadata and the page: one query per request.
const loadCompare = cache(async (rawIds: string): Promise<InitialCompare> => {
  const ids = splitIds(rawIds);
  const parsed = compareSlugsSchema.safeParse(ids);
  if (!parsed.success) return { key: ids.join(","), colleges: null, error: null };
  try {
    return { key: parsed.data.join(","), colleges: await getCollegesForCompare(parsed.data), error: null };
  } catch (error) {
    if (error instanceof ApiError) return { key: parsed.data.join(","), colleges: null, error: error.message };
    throw error;
  }
});

function idsParam(ids: string | string[] | undefined): string {
  return Array.isArray(ids) ? ids.join(",") : (ids ?? "");
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { colleges } = await loadCompare(idsParam((await searchParams).ids));
  if (!colleges) return { title: "Compare colleges" };
  const title = colleges.map((college) => college.shortName ?? college.name).join(" vs ");
  return {
    title,
    description: `Fees, placements and ratings side by side: ${colleges.map((college) => college.name).join(", ")}.`,
    openGraph: { title, images: colleges[0] ? [{ url: colleges[0].imageUrl }] : undefined },
  };
}

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const initial = await loadCompare(idsParam((await searchParams).ids));
  return (
    <Container className="py-8">
      <CompareView initial={initial} />
    </Container>
  );
}
