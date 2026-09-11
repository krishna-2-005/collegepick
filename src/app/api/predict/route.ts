import { ok, parseWith, route } from "@/lib/api-response";
import { predictQuerySchema } from "@/lib/validations/predict";
import { predictColleges } from "@/server/predict";

// GET /api/predict?exam=JEE_MAIN&rank=12000[&state=Karnataka]
export const GET = route(async (request) => {
  // Blank params (e.g. "state=") count as absent.
  const params = [...request.nextUrl.searchParams].filter(([, value]) => value.trim() !== "");
  const query = parseWith(predictQuerySchema, Object.fromEntries(params));
  return ok(await predictColleges(query));
});
