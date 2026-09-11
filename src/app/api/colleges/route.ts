import { ok, parseWith, route } from "@/lib/api-response";
import { collegeListQuerySchema, searchParamsToObject } from "@/lib/validations/colleges";
import { listColleges } from "@/server/colleges";

export const GET = route(async (request) => {
  const query = parseWith(collegeListQuerySchema, searchParamsToObject(request.nextUrl.searchParams));
  const { items, meta } = await listColleges(query);
  return ok(items, meta);
});
