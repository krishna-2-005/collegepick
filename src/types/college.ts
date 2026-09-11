import type { DegreeValue, ExamValue, OwnershipValue } from "@/lib/constants";
import type { RatingDistribution, ReviewData } from "./review";

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

export type CourseData = {
  id: string;
  name: string;
  degree: DegreeValue;
  durationYears: number;
  totalFees: number;
  seats: number;
};

export type PlacementData = {
  avgPackageLPA: number;
  medianPackageLPA: number;
  highestPackageLPA: number;
  placementRate: number;
  topRecruiters: string[];
  year: number;
};

export type CollegeDetail = Omit<CollegeCardData, "avgPackageLPA" | "placementRate"> & {
  establishedYear: number;
  overview: string;
  website: string | null;
  courses: CourseData[];
  placement: PlacementData | null;
  cutoffs: { exam: ExamValue; closingRank: number; year: number }[];
  ratingDistribution: RatingDistribution;
  reviews: ReviewData[];
  reviewsNextCursor: string | null;
};

export type FilterOptions = {
  states: { value: string; count: number }[];
  cities: { value: string; state: string; count: number }[];
  courses: { value: DegreeValue; label: string; count: number }[];
  exams: { value: ExamValue; label: string; count: number }[];
  ownerships: { value: OwnershipValue; label: string; count: number }[];
  fees: { min: number; max: number };
};
