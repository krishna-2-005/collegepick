import { notFound, ok, route } from "@/lib/api-response";
import { getCollegeBySlug } from "@/server/colleges";

type Context = { params: Promise<{ slug: string }> };

export const GET = route<Context>(async (_request, { params }) => {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);
  if (!college) throw notFound(`No college matches "${slug}". Check the link or search again.`);
  return ok(college);
});
