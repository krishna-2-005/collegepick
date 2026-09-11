import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PredictQuery } from "@/lib/validations/predict";
import type { PredictBand, PredictResponse } from "@/types/college";
import { collegeCardSelect, toCard } from "./colleges";

/** How far a closing rank can be from yours and still count as a reach or a good chance. */
const REACH_FACTOR = 0.8;
const SAFE_FACTOR = 1.3;
const PER_BAND = 18;

/**
 * A closing rank is the last rank admitted, so a higher number is easier to get into.
 * reach: closing rank between 0.8× and 1× your rank (a stretch)
 * good:  1× to 1.3× (you clear it)
 * safe:  1.3× and above (you clear it comfortably)
 */
export function bandFor(closingRank: number, rank: number): PredictBand | null {
  if (closingRank >= rank * SAFE_FACTOR) return "safe";
  if (closingRank >= rank) return "good";
  if (closingRank >= rank * REACH_FACTOR) return "reach";
  return null;
}

export async function predictColleges({ exam, rank, state }: PredictQuery): Promise<PredictResponse> {
  const college: Prisma.CollegeWhereInput | undefined = state ? { state } : undefined;
  const reachFloor = Math.ceil(rank * REACH_FACTOR);
  const safeFloor = Math.ceil(rank * SAFE_FACTOR);

  const ranges: Record<PredictBand, Prisma.IntFilter> = {
    reach: { gte: reachFloor, lt: rank },
    good: { gte: rank, lt: safeFloor },
    safe: { gte: safeFloor },
  };

  const bands = ["reach", "good", "safe"] as const;
  const perBand = await Promise.all(
    bands.map(async (band) => {
      const where: Prisma.ExamCutoffWhereInput = { exam, closingRank: ranges[band], college };
      const [rows, count] = await Promise.all([
        prisma.examCutoff.findMany({
          where,
          // Most competitive first: the best college you can realistically get into leads.
          orderBy: [{ closingRank: "asc" }, { id: "asc" }],
          take: PER_BAND,
          select: { closingRank: true, year: true, college: { select: collegeCardSelect } },
        }),
        prisma.examCutoff.count({ where }),
      ]);
      return { band, rows, count };
    }),
  );

  return {
    results: perBand.flatMap(({ band, rows }) =>
      rows.map((row) => ({ college: toCard(row.college), closingRank: row.closingRank, year: row.year, band })),
    ),
    counts: Object.fromEntries(perBand.map(({ band, count }) => [band, count])) as Record<PredictBand, number>,
  };
}
