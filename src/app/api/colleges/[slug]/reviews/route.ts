import { revalidatePath, revalidateTag } from "next/cache";
import { notFound, ok, parseWith, readJson, route } from "@/lib/api-response";
import { getSessionUser, requireUser } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { reviewInputSchema, reviewListQuerySchema } from "@/lib/validations/reviews";
import { COLLEGES_TAG, findCollegeIdBySlug } from "@/server/colleges";
import { createReview, hasReviewed, listReviews } from "@/server/reviews";

type Context = { params: Promise<{ slug: string }> };

async function collegeIdOr404(slug: string): Promise<string> {
  const collegeId = await findCollegeIdBySlug(slug);
  if (!collegeId) throw notFound(`No college matches "${slug}". Check the link or search again.`);
  return collegeId;
}

export const GET = route<Context>(async (request, { params }) => {
  const { slug } = await params;
  const query = parseWith(reviewListQuerySchema, Object.fromEntries(request.nextUrl.searchParams));
  const collegeId = await collegeIdOr404(slug);
  const viewer = await getSessionUser();
  const [{ items, nextCursor }, viewerHasReviewed] = await Promise.all([
    listReviews(collegeId, { ...query, viewerId: viewer?.id }),
    viewer ? hasReviewed(collegeId, viewer.id) : Promise.resolve(false),
  ]);
  return ok(items, { nextCursor, viewerHasReviewed });
});

export const POST = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { slug } = await params;
  enforceRateLimit(`review:${user.id}`, { limit: 5, windowMs: 60_000 }, "You're posting reviews too quickly.");
  const input = parseWith(reviewInputSchema, await readJson(request));
  const collegeId = await collegeIdOr404(slug);
  const result = await createReview(collegeId, user.id, input);
  // Everything that shows this rating is cached: the college page, home, and list queries.
  revalidatePath(`/colleges/${slug}`);
  revalidatePath("/");
  revalidateTag(COLLEGES_TAG);
  return ok(result, undefined, { status: 201 });
});
