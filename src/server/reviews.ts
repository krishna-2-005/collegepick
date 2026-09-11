import "server-only";
import { Prisma } from "@prisma/client";
import { badRequest, conflict } from "@/lib/api-response";
import { decodeCursor, encodeCursor } from "@/lib/cursor";
import { prisma } from "@/lib/prisma";
import type { ReviewInput } from "@/lib/validations/reviews";
import type { RatingDistribution, ReviewData } from "@/types/review";

export const REVIEW_PAGE_SIZE = 10;

export const reviewSelect = {
  id: true,
  rating: true,
  title: true,
  body: true,
  createdAt: true,
  userId: true,
  user: { select: { name: true } },
} satisfies Prisma.ReviewSelect;

type ReviewRow = Prisma.ReviewGetPayload<{ select: typeof reviewSelect }>;

/** "Aarav Sharma" -> "Aarav S." so full names are never published. */
function displayName(name: string): string {
  const [first = "Student", ...rest] = name.trim().split(/\s+/);
  const last = rest[rest.length - 1];
  return last ? `${first} ${last[0]!.toUpperCase()}.` : first;
}

export function toReview(row: ReviewRow, viewerId?: string): ReviewData {
  return {
    id: row.id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    author: displayName(row.user.name),
    ...(viewerId ? { isOwn: row.userId === viewerId } : {}),
  };
}

/** Newest first, keyset-paged on (createdAt, id). */
export async function listReviews(
  collegeId: string,
  { cursor: rawCursor, limit = REVIEW_PAGE_SIZE, viewerId }: { cursor?: string; limit?: number; viewerId?: string } = {},
): Promise<{ items: ReviewData[]; nextCursor: string | null }> {
  let after: Prisma.ReviewWhereInput = {};
  if (rawCursor) {
    const cursor = decodeCursor(rawCursor);
    const date = cursor ? new Date(String(cursor.v)) : null;
    if (!cursor || !date || Number.isNaN(date.getTime())) {
      throw badRequest("The cursor is invalid. Start again from the first page.", [
        { path: "cursor", message: "Malformed cursor." },
      ]);
    }
    after = { OR: [{ createdAt: { lt: date } }, { createdAt: date, id: { lt: cursor.id } }] };
  }

  const rows = await prisma.review.findMany({
    where: { collegeId, ...after },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: reviewSelect,
  });

  const page = rows.slice(0, limit);
  const last = page[page.length - 1];
  const nextCursor =
    rows.length > limit && last ? encodeCursor({ v: last.createdAt.toISOString(), id: last.id }) : null;

  return { items: page.map((row) => toReview(row, viewerId)), nextCursor };
}

export async function hasReviewed(collegeId: string, userId: string): Promise<boolean> {
  const review = await prisma.review.findUnique({
    where: { collegeId_userId: { collegeId, userId } },
    select: { id: true },
  });
  return Boolean(review);
}

/**
 * Creates the review and recomputes the college's denormalized rating in one
 * transaction. `FOR UPDATE` on the college row serialises concurrent reviews for
 * the same college, so each recompute sees every committed review.
 */
export async function createReview(
  collegeId: string,
  userId: string,
  input: ReviewInput,
): Promise<{ review: ReviewData; rating: number; ratingCount: number }> {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "College" WHERE id = ${collegeId} FOR UPDATE`;
      const row = await tx.review.create({
        data: { collegeId, userId, rating: input.rating, title: input.title, body: input.body },
        select: reviewSelect,
      });
      const stats = await tx.review.aggregate({
        where: { collegeId },
        _avg: { rating: true },
        _count: { _all: true },
      });
      const rating = Math.round((stats._avg.rating ?? 0) * 100) / 100;
      const ratingCount = stats._count._all;
      await tx.college.update({ where: { id: collegeId }, data: { rating, ratingCount } });
      return { review: toReview(row, userId), rating, ratingCount };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw conflict("You've already reviewed this college. Each account can post one review per college.");
    }
    throw error;
  }
}

export async function getRatingDistribution(collegeId: string): Promise<RatingDistribution> {
  const groups = await prisma.review.groupBy({
    by: ["rating"],
    where: { collegeId },
    _count: { _all: true },
  });
  const distribution: RatingDistribution = [0, 0, 0, 0, 0];
  for (const group of groups) {
    if (group.rating >= 1 && group.rating <= 5) distribution[group.rating - 1] = group._count._all;
  }
  return distribution;
}
