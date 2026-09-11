import { z } from "zod";
import { DEGREES, EXAMS, MAX_PAGE_SIZE, OWNERSHIPS, PAGE_SIZE, SORTS } from "@/lib/constants";

const ARRAY_KEYS = ["state", "course", "exam", "ownership"] as const;

/**
 * Flattens URLSearchParams into a plain object for zod. Array params accept
 * repeated keys (`state=A&state=B`), bracket keys (`state[]=A`) and comma lists
 * (`state=A,B`), which is what nuqs writes. Empty strings count as absent.
 */
export function searchParamsToObject(params: URLSearchParams): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of new Set(params.keys())) {
    const base = key.endsWith("[]") ? key.slice(0, -2) : key;
    if ((ARRAY_KEYS as readonly string[]).includes(base)) {
      const values = [...params.getAll(base), ...params.getAll(`${base}[]`)]
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean);
      if (values.length > 0) out[base] = [...new Set(values)];
    } else {
      const value = params.get(key)?.trim();
      if (value) out[key] = value;
    }
  }
  return out;
}

const money = z.coerce.number().int("Must be a whole number of rupees.").min(0).max(10_000_000);

export const collegeListQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    state: z.array(z.string().min(1).max(50)).max(15).optional(),
    city: z.string().min(1).max(60).optional(),
    course: z.array(z.enum(DEGREES)).optional(),
    exam: z.array(z.enum(EXAMS)).optional(),
    ownership: z.array(z.enum(OWNERSHIPS)).optional(),
    minFees: money.optional(),
    maxFees: money.optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sort: z.enum(SORTS).default("rating"),
    cursor: z.string().max(300).optional(),
    // Values above the cap are clamped rather than rejected.
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .default(PAGE_SIZE)
      .transform((value) => Math.min(value, MAX_PAGE_SIZE)),
  })
  .refine((query) => query.minFees === undefined || query.maxFees === undefined || query.minFees <= query.maxFees, {
    message: "The minimum fee is higher than the maximum fee.",
    path: ["minFees"],
  });

export type CollegeListQuery = z.infer<typeof collegeListQuerySchema>;

/** Filters only (no paging), used for counts and the listing page's initial render. */
export type CollegeFilters = Omit<CollegeListQuery, "cursor" | "limit">;
