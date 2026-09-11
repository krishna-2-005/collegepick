import { z } from "zod";
import { MAX_COMPARE } from "@/lib/constants";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Not a valid college id.").max(160);

/** 2–3 distinct college slugs, from `?ids=a,b,c` or a JSON array. */
export const compareSlugsSchema = z
  .array(slug)
  .min(2, "Pick at least 2 colleges to compare.")
  .max(MAX_COMPARE, `You can compare up to ${MAX_COMPARE} colleges.`)
  .refine((ids) => new Set(ids).size === ids.length, "Each college can only appear once in a comparison.");

export function splitIds(raw: string | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export const collegeIdSchema = z.object({
  collegeId: z.string({ error: "collegeId is required." }).min(1, "collegeId is required.").max(64),
});

export const saveComparisonSchema = z.object({
  slugs: compareSlugsSchema,
  name: z.string().trim().max(80, "Keep the name under 80 characters.").optional(),
});

export const comparisonIdSchema = z.object({
  id: z.string({ error: "id is required." }).min(1, "id is required.").max(64),
});
