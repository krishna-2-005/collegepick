import { ok, parseWith, route } from "@/lib/api-response";
import { compareSlugsSchema, splitIds } from "@/lib/validations/saved";
import { getCollegesForCompare } from "@/server/colleges";

// GET /api/colleges/compare?ids=slug-a,slug-b[,slug-c]
export const GET = route(async (request) => {
  const slugs = parseWith(compareSlugsSchema, splitIds(request.nextUrl.searchParams.get("ids")));
  return ok(await getCollegesForCompare(slugs));
});
