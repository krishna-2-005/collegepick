"use client";

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import type { ReviewInput } from "@/lib/validations/reviews";
import type { ReviewData } from "@/types/review";

export type ReviewsMeta = { nextCursor: string | null; viewerHasReviewed?: boolean };
type ReviewPage = { data: ReviewData[]; meta: ReviewsMeta };
export type CreatedReview = { review: ReviewData; rating: number; ratingCount: number };

export const reviewsKey = (slug: string) => ["reviews", slug] as const;

export function useReviews(slug: string, initial: { reviews: ReviewData[]; nextCursor: string | null }) {
  const { status } = useSession();
  const query = useInfiniteQuery({
    queryKey: reviewsKey(slug),
    queryFn: ({ pageParam, signal }) =>
      apiFetch<ReviewData[], ReviewsMeta>(
        `/api/colleges/${slug}/reviews${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ""}`,
        { signal },
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last: ReviewPage) => last.meta.nextCursor,
    initialData: { pages: [{ data: initial.reviews, meta: { nextCursor: initial.nextCursor } }], pageParams: [null] },
    staleTime: 60_000,
  });

  // The page is cached for everyone; once we know who's viewing, refetch to learn
  // whether they've already reviewed and which review is theirs.
  const { refetch } = query;
  useEffect(() => {
    if (status === "authenticated") void refetch();
  }, [status, refetch]);

  return query;
}

/** Optimistic create: the review appears at the top immediately and rolls back on failure. */
export function useCreateReview(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReviewInput) =>
      (await apiFetch<CreatedReview>(`/api/colleges/${slug}/reviews`, { method: "POST", json: input })).data,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: reviewsKey(slug) });
      const previous = queryClient.getQueryData<InfiniteData<ReviewPage>>(reviewsKey(slug));
      const optimistic: ReviewData = {
        id: `pending-${Date.now()}`,
        ...input,
        createdAt: new Date().toISOString(),
        author: "You",
        isOwn: true,
      };
      queryClient.setQueryData<InfiniteData<ReviewPage>>(reviewsKey(slug), (data) => prepend(data, optimistic, true));
      return { previous, optimisticId: optimistic.id };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(reviewsKey(slug), context?.previous);
    },
    onSuccess: (created, _input, context) => {
      queryClient.setQueryData<InfiniteData<ReviewPage>>(reviewsKey(slug), (data) => {
        const withoutPending = data && {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: page.data.filter((review) => review.id !== context?.optimisticId),
          })),
        };
        return prepend(withoutPending, created.review, true);
      });
    },
  });
}

function prepend(data: InfiniteData<ReviewPage> | undefined, review: ReviewData, viewerHasReviewed: boolean) {
  if (!data) return data;
  const [first, ...rest] = data.pages;
  if (!first) return data;
  return {
    ...data,
    pages: [{ data: [review, ...first.data], meta: { ...first.meta, viewerHasReviewed } }, ...rest],
  };
}
