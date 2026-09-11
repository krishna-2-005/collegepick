import { notFound, ok, parseWith, route } from "@/lib/api-response";
import { reviewListQuerySchema } from "@/lib/validations/reviews";
import { findCollegeIdBySlug } from "@/server/colleges";
import { listReviews } from "@/server/reviews";

type Context = { params: Promise<{ slug: string }> };

export const GET = route<Context>(async (request, { params }) => {
  const { slug } = await params;
  const query = parseWith(reviewListQuerySchema, Object.fromEntries(request.nextUrl.searchParams));
  const collegeId = await findCollegeIdBySlug(slug);
  if (!collegeId) throw notFound(`No college matches "${slug}". Check the link or search again.`);
  const { items, nextCursor } = await listReviews(collegeId, query);
  return ok(items, { nextCursor });
});
