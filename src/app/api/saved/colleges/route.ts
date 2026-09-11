import { ok, parseWith, readJson, route } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { collegeIdSchema } from "@/lib/validations/saved";
import { listSavedColleges, saveCollege, unsaveCollege } from "@/server/saved";

export const GET = route(async () => {
  const user = await requireUser();
  return ok(await listSavedColleges(user.id));
});

// 201 when newly saved, 200 when it was already saved (idempotent).
export const POST = route(async (request) => {
  const user = await requireUser();
  const { collegeId } = parseWith(collegeIdSchema, await readJson(request));
  const { created } = await saveCollege(user.id, collegeId);
  return ok({ collegeId, saved: true }, undefined, { status: created ? 201 : 200 });
});

// DELETE /api/saved/colleges?collegeId=… (idempotent)
export const DELETE = route(async (request) => {
  const user = await requireUser();
  const { collegeId } = parseWith(collegeIdSchema, Object.fromEntries(request.nextUrl.searchParams));
  const { removed } = await unsaveCollege(user.id, collegeId);
  return ok({ collegeId, saved: false, removed });
});
