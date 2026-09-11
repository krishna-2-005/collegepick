export type ReviewData = {
  id: string;
  rating: number;
  title: string;
  body: string;
  /** ISO timestamp. */
  createdAt: string;
  /** First name and last initial, e.g. "Aarav S." */
  author: string;
  /** True when the signed-in user wrote it. */
  isOwn?: boolean;
};

export type ReviewListMeta = { nextCursor: string | null };

/** Count of reviews per star, index 0 = 1 star … index 4 = 5 stars. */
export type RatingDistribution = [number, number, number, number, number];
