import type { DegreeValue, ExamValue, OwnershipValue } from "@/lib/constants";

/** Everything a CollegeCard, compare avatar or saved row needs. */
export type CollegeCardData = {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  city: string;
  state: string;
  ownership: OwnershipValue;
  rating: number;
  ratingCount: number;
  minFees: number;
  maxFees: number;
  imageUrl: string;
  nirfRank: number | null;
  avgPackageLPA: number | null;
  placementRate: number | null;
};

export type CollegeListMeta = { nextCursor: string | null; total: number };

export type FilterOptions = {
  states: { value: string; count: number }[];
  cities: { value: string; state: string; count: number }[];
  courses: { value: DegreeValue; label: string; count: number }[];
  exams: { value: ExamValue; label: string; count: number }[];
  ownerships: { value: OwnershipValue; label: string; count: number }[];
  fees: { min: number; max: number };
};
