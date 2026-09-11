"use client";

import { MessageSquareText, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StarRow } from "@/components/ui/star-rating";
import { toast } from "@/components/ui/toast";
import { useLoginRedirect } from "@/hooks/use-saved";
import { useCreateReview, useReviews } from "@/hooks/use-reviews";
import { formatCount, formatDate, formatRating } from "@/lib/format";
import type { ReviewInput } from "@/lib/validations/reviews";
import type { RatingDistribution, ReviewData } from "@/types/review";
import { ReviewFormDialog, emptyDraft, type ReviewDraft } from "./review-form-dialog";

type ReviewsSectionProps = {
  slug: string;
  collegeName: string;
  rating: number;
  ratingCount: number;
  distribution: RatingDistribution;
  reviews: ReviewData[];
  nextCursor: string | null;
};

export function ReviewsSection(props: ReviewsSectionProps) {
  const { slug, collegeName } = props;
  const router = useRouter();
  const { status } = useSession();
  const redirectToLogin = useLoginRedirect();
  const query = useReviews(slug, { reviews: props.reviews, nextCursor: props.nextCursor });
  const create = useCreateReview(slug);

  const [stats, setStats] = useState({ rating: props.rating, count: props.ratingCount, distribution: props.distribution });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ReviewDraft>(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);

  const reviews = query.data?.pages.flatMap((page) => page.data) ?? [];
  const viewerHasReviewed = Boolean(query.data?.pages[0]?.meta.viewerHasReviewed) || create.isPending;

  function openForm() {
    if (status !== "authenticated") {
      redirectToLogin("Log in to write a review.");
      return;
    }
    setFormError(null);
    setDialogOpen(true);
  }

  function publish(input: ReviewInput) {
    // Optimistic: close now, the review is already at the top of the list.
    setDialogOpen(false);
    create.mutate(input, {
      onSuccess: (created) => {
        setStats((current) => {
          const distribution = current.distribution.map((count, index) =>
            index === input.rating - 1 ? count + 1 : count,
          ) as RatingDistribution;
          return { rating: created.rating, count: created.ratingCount, distribution };
        });
        setDraft(emptyDraft);
        toast.success("Review published", { description: "Thanks for helping other students decide." });
        // Refresh server-rendered parts (header rating) from the revalidated page.
        router.refresh();
      },
      onError: (error) => {
        // Put the draft back in front of them with the reason.
        setFormError(error.message);
        setDialogOpen(true);
      },
    });
  }

  const maxBar = Math.max(...stats.distribution, 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl">Reviews</h2>
        {viewerHasReviewed ? (
          <Badge tone="accent" className="h-9 px-3 text-sm">
            You reviewed this college
          </Badge>
        ) : (
          <Button icon={<PencilLine aria-hidden className="size-4.5" />} onClick={openForm}>
            Write a review
          </Button>
        )}
      </div>

      {stats.count > 0 ? (
        <Card className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-semibold tracking-tight">{formatRating(stats.rating)}</span>
            <StarRow value={Math.round(stats.rating)} />
            <span className="text-sm text-ink-muted">
              {formatCount(stats.count)} {stats.count === 1 ? "review" : "reviews"}
            </span>
          </div>
          <dl className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const value = stats.distribution[star - 1] ?? 0;
              return (
                <div key={star} className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3 text-sm">
                  <dt className="text-ink-muted">{star} {star === 1 ? "star" : "stars"}</dt>
                  <dd className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(value / maxBar) * 100}%` }} />
                  </dd>
                  <dd className="text-right text-ink">{value}</dd>
                </div>
              );
            })}
          </dl>
        </Card>
      ) : null}

      {reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquareText />}
          title="No reviews yet"
          description={`Be the first to share what ${collegeName} is like.`}
          action={<Button onClick={openForm}>Write a review</Button>}
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <Card className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StarRow value={review.rating} />
                  {review.isOwn ? <Badge tone="accent">Your review</Badge> : null}
                </div>
                <h3 className="font-sans text-base font-semibold">{review.title}</h3>
                <p className="max-w-[70ch] text-[0.9375rem] text-ink">{review.body}</p>
                <p className="text-sm text-ink-muted">
                  {review.author} · {review.id.startsWith("pending-") ? "Publishing…" : formatDate(review.createdAt)}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      )}

      {query.hasNextPage ? (
        <Button
          variant="secondary"
          className="self-center"
          loading={query.isFetchingNextPage}
          loadingText="Loading reviews…"
          onClick={() => void query.fetchNextPage()}
        >
          Load more reviews
        </Button>
      ) : null}

      <ReviewFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        collegeName={collegeName}
        draft={draft}
        onDraftChange={setDraft}
        formError={formError}
        onSubmit={publish}
      />
    </div>
  );
}
