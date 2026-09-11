import "server-only";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import { badRequest } from "@/lib/api-response";
import { DEGREE_LABELS, EXAM_LABELS, OWNERSHIP_LABELS, type SortValue } from "@/lib/constants";
import { decodeCursor, encodeCursor, type Cursor } from "@/lib/cursor";
import { prisma } from "@/lib/prisma";
import type { CollegeFilters, CollegeListQuery } from "@/lib/validations/colleges";
import type { CollegeCardData, CollegeDetail, CollegeListMeta, FilterOptions } from "@/types/college";
import { getRatingDistribution, listReviews } from "./reviews";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return slug.length <= 160 && SLUG_PATTERN.test(slug);
}

export const collegeCardSelect = {
  id: true,
  slug: true,
  name: true,
  shortName: true,
  city: true,
  state: true,
  ownership: true,
  rating: true,
  ratingCount: true,
  minFees: true,
  maxFees: true,
  imageUrl: true,
  nirfRank: true,
  placement: { select: { avgPackageLPA: true, placementRate: true } },
} satisfies Prisma.CollegeSelect;

type CollegeCardRow = Prisma.CollegeGetPayload<{ select: typeof collegeCardSelect }>;

export function toCard(row: CollegeCardRow): CollegeCardData {
  const { placement, ...rest } = row;
  return {
    ...rest,
    avgPackageLPA: placement?.avgPackageLPA ?? null,
    placementRate: placement?.placementRate ?? null,
  };
}

function buildWhere(filters: CollegeFilters): Prisma.CollegeWhereInput {
  const and: Prisma.CollegeWhereInput[] = [];
  const insensitive = Prisma.QueryMode.insensitive;

  if (filters.q) {
    const q = filters.q;
    and.push({
      OR: [
        { name: { contains: q, mode: insensitive } },
        { shortName: { contains: q, mode: insensitive } },
        { city: { contains: q, mode: insensitive } },
        { state: { contains: q, mode: insensitive } },
        { courses: { some: { name: { contains: q, mode: insensitive } } } },
      ],
    });
  }
  if (filters.state?.length) and.push({ state: { in: filters.state } });
  if (filters.city) and.push({ city: { equals: filters.city, mode: insensitive } });
  if (filters.course?.length) and.push({ courses: { some: { degree: { in: filters.course } } } });
  if (filters.exam?.length) and.push({ examCutoffs: { some: { exam: { in: filters.exam } } } });
  if (filters.ownership?.length) and.push({ ownership: { in: filters.ownership } });
  // Fee range overlap: the college has at least one programme inside the budget.
  if (filters.minFees !== undefined) and.push({ maxFees: { gte: filters.minFees } });
  if (filters.maxFees !== undefined) and.push({ minFees: { lte: filters.maxFees } });
  if (filters.minRating !== undefined) and.push({ rating: { gte: filters.minRating } });
  // Sorting by package needs a placement row; every seeded college has one.
  if (filters.sort === "package") and.push({ placement: { isNot: null } });

  return and.length > 0 ? { AND: and } : {};
}

type SortSpec = {
  orderBy: Prisma.CollegeOrderByWithRelationInput[];
  valueOf: (row: CollegeCardRow) => number | string;
  /** Rows strictly after the cursor in this sort order. */
  after: (cursor: Cursor) => Prisma.CollegeWhereInput;
};

const SORT_SPECS: Record<SortValue, SortSpec> = {
  rating: {
    orderBy: [{ rating: "desc" }, { id: "asc" }],
    valueOf: (row) => row.rating,
    after: ({ v, id }) => ({ OR: [{ rating: { lt: Number(v) } }, { rating: Number(v), id: { gt: id } }] }),
  },
  package: {
    orderBy: [{ placement: { avgPackageLPA: "desc" } }, { id: "asc" }],
    valueOf: (row) => row.placement?.avgPackageLPA ?? 0,
    after: ({ v, id }) => ({
      OR: [
        { placement: { is: { avgPackageLPA: { lt: Number(v) } } } },
        { placement: { is: { avgPackageLPA: Number(v) } }, id: { gt: id } },
      ],
    }),
  },
  fees_asc: {
    orderBy: [{ minFees: "asc" }, { id: "asc" }],
    valueOf: (row) => row.minFees,
    after: ({ v, id }) => ({ OR: [{ minFees: { gt: Number(v) } }, { minFees: Number(v), id: { gt: id } }] }),
  },
  fees_desc: {
    orderBy: [{ maxFees: "desc" }, { id: "asc" }],
    valueOf: (row) => row.maxFees,
    after: ({ v, id }) => ({ OR: [{ maxFees: { lt: Number(v) } }, { maxFees: Number(v), id: { gt: id } }] }),
  },
  name: {
    orderBy: [{ name: "asc" }, { id: "asc" }],
    valueOf: (row) => row.name,
    after: ({ v, id }) => ({ OR: [{ name: { gt: String(v) } }, { name: String(v), id: { gt: id } }] }),
  },
};

export async function listColleges(
  query: CollegeListQuery,
): Promise<{ items: CollegeCardData[]; meta: CollegeListMeta }> {
  const { cursor: rawCursor, limit, ...filters } = query;
  const spec = SORT_SPECS[filters.sort];
  const where = buildWhere(filters);

  let cursor: Cursor | null = null;
  if (rawCursor) {
    cursor = decodeCursor(rawCursor);
    if (!cursor) throw badRequest("The cursor is invalid. Start again from the first page.", [
      { path: "cursor", message: "Malformed cursor." },
    ]);
  }

  const [rows, total] = await Promise.all([
    prisma.college.findMany({
      where: cursor ? { AND: [where, spec.after(cursor)] } : where,
      orderBy: spec.orderBy,
      take: limit + 1,
      select: collegeCardSelect,
    }),
    prisma.college.count({ where }),
  ]);

  const page = rows.slice(0, limit);
  const last = page[page.length - 1];
  const nextCursor = rows.length > limit && last ? encodeCursor({ v: spec.valueOf(last), id: last.id }) : null;

  return { items: page.map(toCard), meta: { nextCursor, total } };
}

/**
 * Full detail for one college, or null. Wrapped in React `cache` so the page and
 * its generateMetadata share one query per request.
 */
export const getCollegeBySlug = cache(async (slug: string, viewerId?: string): Promise<CollegeDetail | null> => {
  if (!isValidSlug(slug)) return null;

  const college = await prisma.college.findUnique({
    where: { slug },
    select: {
      ...collegeCardSelect,
      establishedYear: true,
      overview: true,
      website: true,
      placement: {
        select: {
          avgPackageLPA: true,
          medianPackageLPA: true,
          highestPackageLPA: true,
          placementRate: true,
          topRecruiters: true,
          year: true,
        },
      },
      courses: {
        select: { id: true, name: true, degree: true, durationYears: true, totalFees: true, seats: true },
        orderBy: [{ degree: "asc" }, { name: "asc" }],
      },
      examCutoffs: {
        select: { exam: true, closingRank: true, year: true },
        orderBy: { exam: "asc" },
      },
    },
  });
  if (!college) return null;

  const [ratingDistribution, reviews] = await Promise.all([
    getRatingDistribution(college.id),
    listReviews(college.id, { viewerId }),
  ]);

  const { examCutoffs, ...rest } = college;
  return {
    ...rest,
    cutoffs: examCutoffs,
    ratingDistribution,
    reviews: reviews.items,
    reviewsNextCursor: reviews.nextCursor,
  };
});

/** Minimal lookup used by write paths (reviews, saves). */
export async function findCollegeIdBySlug(slug: string): Promise<string | null> {
  if (!isValidSlug(slug)) return null;
  const college = await prisma.college.findUnique({ where: { slug }, select: { id: true } });
  return college?.id ?? null;
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const [states, cities, ownerships, courses, exams, fees] = await Promise.all([
    prisma.college.groupBy({ by: ["state"], _count: { _all: true } }),
    prisma.college.groupBy({ by: ["state", "city"], _count: { _all: true } }),
    prisma.college.groupBy({ by: ["ownership"], _count: { _all: true } }),
    prisma.$queryRaw<{ degree: keyof typeof DEGREE_LABELS; count: number }[]>`
      SELECT degree, COUNT(DISTINCT "collegeId")::int AS count FROM "Course" GROUP BY degree`,
    prisma.$queryRaw<{ exam: keyof typeof EXAM_LABELS; count: number }[]>`
      SELECT exam, COUNT(DISTINCT "collegeId")::int AS count FROM "ExamCutoff" GROUP BY exam`,
    prisma.college.aggregate({ _min: { minFees: true }, _max: { maxFees: true } }),
  ]);

  const degreeOrder = Object.keys(DEGREE_LABELS);
  const examOrder = Object.keys(EXAM_LABELS);
  const ownershipOrder = Object.keys(OWNERSHIP_LABELS);

  return {
    states: states
      .map((row) => ({ value: row.state, count: row._count._all }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
    cities: cities
      .map((row) => ({ value: row.city, state: row.state, count: row._count._all }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    courses: courses
      .map((row) => ({ value: row.degree, label: DEGREE_LABELS[row.degree], count: row.count }))
      .sort((a, b) => degreeOrder.indexOf(a.value) - degreeOrder.indexOf(b.value)),
    exams: exams
      .map((row) => ({ value: row.exam, label: EXAM_LABELS[row.exam], count: row.count }))
      .sort((a, b) => examOrder.indexOf(a.value) - examOrder.indexOf(b.value)),
    ownerships: ownerships
      .map((row) => ({ value: row.ownership, label: OWNERSHIP_LABELS[row.ownership], count: row._count._all }))
      .sort((a, b) => ownershipOrder.indexOf(a.value) - ownershipOrder.indexOf(b.value)),
    fees: { min: fees._min.minFees ?? 0, max: fees._max.maxFees ?? 0 },
  };
}
