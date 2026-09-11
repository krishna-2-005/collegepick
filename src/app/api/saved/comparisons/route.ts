import { ok, parseWith, readJson, route } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { comparisonIdSchema, saveComparisonSchema } from "@/lib/validations/saved";
import { deleteComparison, listComparisons, saveComparison } from "@/server/saved";

export const GET = route(async () => {
  const user = await requireUser();
  return ok(await listComparisons(user.id));
});

// 201 when new, 200 when the same set of colleges was already saved (idempotent).
export const POST = route(async (request) => {
  const user = await requireUser();
  const { slugs, name } = parseWith(saveComparisonSchema, await readJson(request));
  const { comparison, created } = await saveComparison(user.id, slugs, name);
  return ok(comparison, undefined, { status: created ? 201 : 200 });
});

// DELETE /api/saved/comparisons?id=…
export const DELETE = route(async (request) => {
  const user = await requireUser();
  const { id } = parseWith(comparisonIdSchema, Object.fromEntries(request.nextUrl.searchParams));
  await deleteComparison(user.id, id);
  return ok({ id, deleted: true });
});
