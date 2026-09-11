import "server-only";
import { Prisma } from "@prisma/client";
import { notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import type { CollegeSummary, SavedCollegeData, SavedComparisonData } from "@/types/college";
import { collegeCardSelect, toCard } from "./colleges";

// ---------- saved colleges ----------

export async function listSavedColleges(userId: string): Promise<SavedCollegeData[]> {
  const rows = await prisma.savedCollege.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, college: { select: collegeCardSelect } },
  });
  return rows.map((row) => ({ ...toCard(row.college), savedAt: row.createdAt.toISOString() }));
}

/** Idempotent: returns `created: false` when it was already saved. */
export async function saveCollege(userId: string, collegeId: string): Promise<{ created: boolean }> {
  const college = await prisma.college.findUnique({ where: { id: collegeId }, select: { id: true } });
  if (!college) throw notFound("That college no longer exists. Refresh the page and try again.");
  try {
    await prisma.savedCollege.create({ data: { userId, collegeId } });
    return { created: true };
  } catch (error) {
    // Already saved (including a double-click race): treat as success.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { created: false };
    throw error;
  }
}

/** Idempotent: removing something that isn't saved is not an error. */
export async function unsaveCollege(userId: string, collegeId: string): Promise<{ removed: boolean }> {
  const result = await prisma.savedCollege.deleteMany({ where: { userId, collegeId } });
  return { removed: result.count > 0 };
}

// ---------- saved comparisons ----------

const summarySelect = {
  id: true,
  slug: true,
  name: true,
  shortName: true,
  imageUrl: true,
  city: true,
  state: true,
} satisfies Prisma.CollegeSelect;

export async function listComparisons(userId: string): Promise<SavedComparisonData[]> {
  const comparisons = await prisma.savedComparison.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true, collegeIds: true },
  });
  const ids = [...new Set(comparisons.flatMap((comparison) => comparison.collegeIds))];
  const colleges = await prisma.college.findMany({ where: { id: { in: ids } }, select: summarySelect });
  const byId = new Map<string, CollegeSummary>(colleges.map((college) => [college.id, college]));

  return comparisons.map((comparison) => ({
    id: comparison.id,
    name: comparison.name,
    createdAt: comparison.createdAt.toISOString(),
    // Skip colleges deleted since the comparison was saved.
    colleges: comparison.collegeIds.flatMap((id) => byId.get(id) ?? []),
  }));
}

/**
 * Saves the colleges (given by slug) as a comparison. Idempotent: the same set of
 * colleges, in any order, returns the existing comparison with `created: false`.
 */
export async function saveComparison(
  userId: string,
  slugs: string[],
  name?: string,
): Promise<{ comparison: SavedComparisonData; created: boolean }> {
  const colleges = await prisma.college.findMany({ where: { slug: { in: slugs } }, select: summarySelect });
  const bySlug = new Map(colleges.map((college) => [college.slug, college]));
  const missing = slugs.filter((slug) => !bySlug.has(slug));
  if (missing.length > 0) {
    throw notFound(`We couldn't find ${missing.map((slug) => `"${slug}"`).join(", ")}. Remove it and try again.`);
  }
  const ordered = slugs.map((slug) => bySlug.get(slug)!);
  const collegeIds = ordered.map((college) => college.id);

  const candidates = await prisma.savedComparison.findMany({
    where: { userId, collegeIds: { hasEvery: collegeIds } },
    select: { id: true, name: true, createdAt: true, collegeIds: true },
  });
  const existing = candidates.find((candidate) => candidate.collegeIds.length === collegeIds.length);
  if (existing) {
    return {
      created: false,
      comparison: { id: existing.id, name: existing.name, createdAt: existing.createdAt.toISOString(), colleges: ordered },
    };
  }

  const created = await prisma.savedComparison.create({
    data: { userId, collegeIds, name: name || null },
    select: { id: true, name: true, createdAt: true },
  });
  return {
    created: true,
    comparison: { id: created.id, name: created.name, createdAt: created.createdAt.toISOString(), colleges: ordered },
  };
}

/** Deletes only the caller's own comparison; anything else is a 404. */
export async function deleteComparison(userId: string, id: string): Promise<void> {
  const result = await prisma.savedComparison.deleteMany({ where: { id, userId } });
  if (result.count === 0) throw notFound("That comparison doesn't exist or was already deleted.");
}
