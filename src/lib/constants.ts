// Enum values mirrored from prisma/schema.prisma so client code can use them
// without importing @prisma/client. The string unions are assignable to Prisma's enums.

export const DEGREES = ["BTECH", "MTECH", "MBA", "MBBS", "BSC", "BCOM", "BA"] as const;
export type DegreeValue = (typeof DEGREES)[number];

export const EXAMS = ["JEE_MAIN", "JEE_ADV", "NEET", "CAT", "GATE"] as const;
export type ExamValue = (typeof EXAMS)[number];

export const OWNERSHIPS = ["PUBLIC", "PRIVATE", "DEEMED"] as const;
export type OwnershipValue = (typeof OWNERSHIPS)[number];

export const SORTS = ["rating", "package", "fees_asc", "fees_desc", "name"] as const;
export type SortValue = (typeof SORTS)[number];

export const DEGREE_LABELS: Record<DegreeValue, string> = {
  BTECH: "B.Tech",
  MTECH: "M.Tech",
  MBA: "MBA",
  MBBS: "MBBS",
  BSC: "B.Sc",
  BCOM: "B.Com",
  BA: "BA",
};

export const EXAM_LABELS: Record<ExamValue, string> = {
  JEE_MAIN: "JEE Main",
  JEE_ADV: "JEE Advanced",
  NEET: "NEET",
  CAT: "CAT",
  GATE: "GATE",
};

export const OWNERSHIP_LABELS: Record<OwnershipValue, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  DEEMED: "Deemed",
};

export const SORT_LABELS: Record<SortValue, string> = {
  rating: "Rating",
  package: "Average package",
  fees_asc: "Fees: low to high",
  fees_desc: "Fees: high to low",
  name: "Name",
};

export const RATING_OPTIONS = [3, 4, 4.5] as const;

export const PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
export const MAX_COMPARE = 3;
