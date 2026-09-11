/**
 * Deterministic seed: 200 fictional colleges across 15 states, 3–6 courses each,
 * placements, exam cutoffs and 3–8 reviews per college from 40 users.
 * Re-running wipes and recreates everything with identical data (fixed faker seed).
 */
import { fakerEN_IN as faker } from "@faker-js/faker";
import { Degree, Exam, Ownership, PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
faker.seed(20260911);

const COLLEGE_COUNT = 200;
const USER_COUNT = 40;
const PLACEMENT_YEAR = 2025;
const DEMO_EMAIL = "demo@collegepick.dev";
const DEMO_PASSWORD = "password123";

const IMAGE_IDS = [
  "1562774053-701939374585", "1541339907198-e08756dedf3f", "1498243691581-b145c3f54a5a",
  "1607237138185-eedd9c632b0b", "1580537659466-0a9bfa916a54", "1519452635265-7b1fbfd1e4e0",
  "1592280771190-3e2e4d571952", "1571260899304-425eee4c7efc", "1606761568499-6d2451b23c66",
  "1576495199011-eb94736d05d6", "1564981797816-1043664bf78d", "1590012314607-cda9d9b699ae",
  "1622397333309-3056849bc70b", "1523240795612-9a054b0db644", "1524178232363-1fb2b075b655",
  "1517486808906-6ca8b3f04846", "1427504494785-3a9ca7044f45", "1541829070764-84a7d30dd3f3",
  "1568792923760-d70635a89fdc", "1521587760476-6c12a4b040da", "1507842217343-583bb7270b66",
  "1481627834876-b7833e8f5570", "1559223607-a43c990c692c", "1574958269340-fa927503f3dd",
  "1605470207062-b72b5cbe2a87", "1531545514256-b1400bc00f31", "1532649538693-f3a2ec1bf8bd",
  "1600903308878-bf5e554ab841", "1613896527026-f195d5c818ed", "1580582932707-520aed937b7b",
];
const IMAGES = IMAGE_IDS.map(
  (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=70`,
);

const STATES: { state: string; count: number; cities: string[] }[] = [
  { state: "Karnataka", count: 22, cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"] },
  { state: "Maharashtra", count: 22, cities: ["Mumbai", "Pune", "Nagpur", "Nashik"] },
  { state: "Tamil Nadu", count: 20, cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"] },
  { state: "Uttar Pradesh", count: 16, cities: ["Noida", "Lucknow", "Kanpur", "Varanasi"] },
  { state: "Telangana", count: 14, cities: ["Hyderabad", "Warangal"] },
  { state: "Andhra Pradesh", count: 12, cities: ["Visakhapatnam", "Vijayawada", "Tirupati", "Guntur"] },
  { state: "Kerala", count: 12, cities: ["Kochi", "Thiruvananthapuram", "Kozhikode"] },
  { state: "Delhi", count: 12, cities: ["New Delhi"] },
  { state: "Gujarat", count: 12, cities: ["Ahmedabad", "Vadodara", "Surat", "Gandhinagar"] },
  { state: "West Bengal", count: 11, cities: ["Kolkata", "Durgapur"] },
  { state: "Rajasthan", count: 10, cities: ["Jaipur", "Jodhpur", "Kota"] },
  { state: "Madhya Pradesh", count: 10, cities: ["Indore", "Bhopal", "Gwalior"] },
  { state: "Punjab", count: 9, cities: ["Mohali", "Ludhiana", "Amritsar"] },
  { state: "Haryana", count: 9, cities: ["Gurugram", "Faridabad", "Kurukshetra"] },
  { state: "Odisha", count: 9, cities: ["Bhubaneswar", "Rourkela", "Cuttack"] },
];

type Kind = "engineering" | "university" | "management" | "medical" | "arts";

const KINDS: { kind: Kind; weight: number }[] = [
  { kind: "engineering", weight: 45 },
  { kind: "university", weight: 15 },
  { kind: "management", weight: 15 },
  { kind: "medical", weight: 12 },
  { kind: "arts", weight: 13 },
];

const SUFFIXES: Record<Kind, string[]> = {
  engineering: [
    "Institute of Technology",
    "College of Engineering",
    "Institute of Engineering and Technology",
    "Institute of Science and Technology",
  ],
  university: ["University"],
  management: ["Institute of Management", "School of Business"],
  medical: ["Institute of Medical Sciences", "Medical College"],
  arts: ["College of Arts and Science", "Degree College"],
};

// Fictional name stems: rivers, ranges and Sanskrit words, not real institutions.
const STEMS = [
  "Kaveri", "Godavari", "Tungabhadra", "Narmada", "Sabarmati", "Mahanadi", "Periyar", "Tapti",
  "Nilgiri", "Sahyadri", "Vindhya", "Aravalli", "Satpura", "Malabar", "Coromandel", "Konkan",
  "Deccan", "Vidya", "Pragati", "Unnati", "Jnana", "Sankalp", "Prerana", "Nirmaan", "Srishti",
  "Samarth", "Utkarsh", "Abhyudaya", "Tejas", "Akshara", "Medha", "Pratibha", "Sanjeevani",
  "Dhanvantari", "Aarogya", "Navodaya", "Suryodaya", "Chaitanya", "Vishwa", "Bharati",
  "Shantiniketan", "Anand", "Sagar", "Kiran", "Prakash", "Jyoti", "Amrit", "Swarna", "Neel",
  "Harit", "Parivartan", "Udaan", "Disha", "Lakshya", "Saksham", "Nalanda", "Vikram", "Ashoka",
];

const COURSES: Record<Kind, { degree: Degree; names: string[] }[]> = {
  engineering: [
    {
      degree: Degree.BTECH,
      names: [
        "Computer Science and Engineering",
        "Electronics and Communication Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Electrical and Electronics Engineering",
        "Information Technology",
        "Artificial Intelligence and Data Science",
        "Chemical Engineering",
      ],
    },
    { degree: Degree.MTECH, names: ["Computer Science", "VLSI Design", "Structural Engineering", "Power Systems"] },
    { degree: Degree.MBA, names: ["Technology Management"] },
  ],
  university: [
    { degree: Degree.BTECH, names: ["Computer Science and Engineering", "Electronics and Communication Engineering"] },
    { degree: Degree.BSC, names: ["Physics", "Mathematics", "Computer Science", "Biotechnology"] },
    { degree: Degree.BCOM, names: ["Commerce", "Accounting and Finance"] },
    { degree: Degree.BA, names: ["Economics", "English", "Psychology"] },
    { degree: Degree.MBA, names: ["Business Administration"] },
    { degree: Degree.MTECH, names: ["Data Science"] },
  ],
  management: [
    { degree: Degree.MBA, names: ["Business Administration", "Finance", "Marketing", "Business Analytics", "Human Resource Management"] },
    { degree: Degree.BCOM, names: ["Commerce", "Accounting and Finance"] },
  ],
  medical: [
    { degree: Degree.MBBS, names: ["Medicine and Surgery"] },
    { degree: Degree.BSC, names: ["Nursing", "Medical Laboratory Technology", "Radiology and Imaging", "Allied Health Sciences"] },
  ],
  arts: [
    { degree: Degree.BA, names: ["English", "Economics", "Psychology", "Journalism", "Political Science", "History"] },
    { degree: Degree.BSC, names: ["Physics", "Chemistry", "Mathematics", "Computer Science"] },
    { degree: Degree.BCOM, names: ["Commerce", "Accounting and Finance"] },
  ],
};

const DURATION: Record<Degree, number> = {
  BTECH: 4, MTECH: 2, MBA: 2, MBBS: 5, BSC: 3, BCOM: 3, BA: 3,
};

// Annual fee ranges in rupees by degree and ownership.
const ANNUAL_FEES: Record<Degree, Record<Ownership, [number, number]>> = {
  BTECH: { PUBLIC: [40_000, 160_000], PRIVATE: [120_000, 380_000], DEEMED: [180_000, 450_000] },
  MTECH: { PUBLIC: [30_000, 120_000], PRIVATE: [100_000, 250_000], DEEMED: [150_000, 300_000] },
  MBA: { PUBLIC: [100_000, 500_000], PRIVATE: [200_000, 900_000], DEEMED: [250_000, 1_000_000] },
  MBBS: { PUBLIC: [20_000, 150_000], PRIVATE: [800_000, 2_200_000], DEEMED: [1_200_000, 2_500_000] },
  BSC: { PUBLIC: [10_000, 60_000], PRIVATE: [40_000, 150_000], DEEMED: [60_000, 200_000] },
  BCOM: { PUBLIC: [8_000, 50_000], PRIVATE: [30_000, 120_000], DEEMED: [50_000, 180_000] },
  BA: { PUBLIC: [5_000, 40_000], PRIVATE: [25_000, 100_000], DEEMED: [40_000, 150_000] },
};

const RECRUITERS: Record<"tech" | "business" | "health" | "general", [string[], string[], string[]]> = {
  tech: [
    ["Google", "Microsoft", "Amazon", "Adobe", "Qualcomm", "Texas Instruments", "Intel", "Oracle", "Cisco", "Flipkart", "Samsung R&D", "Goldman Sachs"],
    ["Deloitte", "Bosch", "Siemens", "L&T", "Honeywell", "ABB", "Zoho", "IBM", "Mercedes-Benz R&D", "Tata Motors", "Mahindra"],
    ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "HCLTech", "Capgemini", "Tech Mahindra"],
  ],
  business: [
    ["McKinsey", "BCG", "Bain", "Goldman Sachs", "J.P. Morgan", "HUL", "P&G", "Amazon"],
    ["Deloitte", "EY", "KPMG", "PwC", "ICICI Bank", "HDFC Bank", "Asian Paints", "ITC", "Aditya Birla Group"],
    ["Axis Bank", "Kotak Mahindra Bank", "Reliance Retail", "Genpact", "Accenture", "Tata Consultancy Services"],
  ],
  health: [
    ["Apollo Hospitals", "Manipal Hospitals", "Medanta", "Fortis Healthcare", "Max Healthcare"],
    ["Narayana Health", "Aster DM Healthcare", "KIMS Hospitals", "Cipla", "Sun Pharma", "Dr. Reddy's"],
    ["Lupin", "Metropolis Healthcare", "Dr Lal PathLabs", "Thyrocare"],
  ],
  general: [
    ["Deloitte", "EY", "KPMG", "Amazon", "ICICI Bank"],
    ["HDFC Bank", "Genpact", "Accenture", "The Hindu", "Teach For India", "Wipro"],
    ["Concentrix", "Axis Bank", "Reliance Retail", "Tata Consultancy Services"],
  ],
};

const RECRUITER_POOL: Record<Kind, keyof typeof RECRUITERS> = {
  engineering: "tech",
  university: "tech",
  management: "business",
  medical: "health",
  arts: "general",
};

// ---------- helpers ----------

const rand = () => faker.number.float({ min: 0, max: 1 });
const between = (min: number, max: number) => min + rand() * (max - min);
const int = (min: number, max: number) => faker.number.int({ min, max });
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, step: number) => Math.round(value / step) * step;
const oneDecimal = (value: number) => Math.round(value * 10) / 10;
const pick = <T>(items: readonly T[]): T => faker.helpers.arrayElement(items);
const sample = <T>(items: readonly T[], count: number): T[] =>
  faker.helpers.arrayElements(items, Math.min(count, items.length));
const id = () => `c${faker.string.alphanumeric({ length: 24, casing: "lower" })}`;

function normal(mean: number, sd: number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function weighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rand() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1]!;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function acronym(name: string): string | null {
  const letters = name
    .split(/\s+/)
    .filter((word) => !["of", "and"].includes(word.toLowerCase()))
    .map((word) => word[0]!.toUpperCase())
    .join("");
  return letters.length >= 3 ? letters : null;
}

function ownershipFor(kind: Kind): Ownership {
  const roll = rand();
  if (kind === "university") return roll < 0.35 ? Ownership.PUBLIC : roll < 0.6 ? Ownership.PRIVATE : Ownership.DEEMED;
  if (kind === "medical") return roll < 0.45 ? Ownership.PUBLIC : roll < 0.8 ? Ownership.PRIVATE : Ownership.DEEMED;
  return roll < 0.3 ? Ownership.PUBLIC : roll < 0.82 ? Ownership.PRIVATE : Ownership.DEEMED;
}

function avgPackageFor(kind: Kind, quality: number): number {
  switch (kind) {
    case "engineering":
      return 3.2 + quality ** 1.5 * 20;
    case "university":
      return 3 + quality * 12;
    case "management":
      return 5 + quality ** 1.3 * 22;
    case "medical":
      return 7 + quality * 10;
    case "arts":
      return 2.4 + quality * 4.5;
  }
}

// ---------- copy ----------

const KIND_WORD: Record<Kind, string> = {
  engineering: "engineering college",
  university: "multidisciplinary university",
  management: "business school",
  medical: "medical college",
  arts: "arts and science college",
};

const OWNERSHIP_WORD: Record<Ownership, string> = {
  PUBLIC: "government-funded",
  PRIVATE: "private",
  DEEMED: "deemed-to-be",
};

const STRENGTHS: Record<Kind, string[]> = {
  engineering: [
    "Its computer science and electronics departments draw the strongest applicants, and final-year students work on industry-sponsored projects.",
    "The college is known for hands-on labs, an active coding club and a steady record in national hackathons.",
    "Students highlight the core engineering departments, which run well-equipped workshops and regular industrial visits.",
  ],
  university: [
    "The university runs programmes across engineering, sciences, commerce and humanities, so students can take electives outside their major.",
    "Its research centres in data science and biotechnology offer undergraduates paid research assistantships.",
    "The campus hosts several departments under one roof, which makes it easy to switch tracks after the first year.",
  ],
  management: [
    "The curriculum leans on live case studies and a mandatory summer internship between the two years.",
    "Its finance and analytics specialisations are the most sought after, backed by an active alumni network in banking and consulting.",
    "Students spend a term on consulting projects with partner companies before final placements.",
  ],
  medical: [
    "The attached teaching hospital gives students clinical exposure from the second year onwards.",
    "Its hospital sees a high patient load, which students say is the best preparation for internships.",
    "The college runs community health camps across the district, and students rotate through them every year.",
  ],
  arts: [
    "Small class sizes and a strong tutorial system are what students mention most.",
    "The college has a lively cultural calendar and well-regarded departments of economics and English.",
    "Its science departments run undergraduate research projects in partnership with nearby institutes.",
  ],
};

const CAMPUS = [
  "The campus has on-site hostels, a central library and sports facilities.",
  "Hostel places are limited, so many students rent rooms close to campus.",
  "The campus is compact and well connected by public transport.",
  "A residential campus with separate hostels, a health centre and an indoor sports complex.",
];

const REVIEW_TITLES = {
  high: ["Worth every rupee", "Great faculty and placements", "Best decision I made", "Strong academics, great peers", "Excellent exposure"],
  mid: ["Good, with a few gaps", "Decent overall", "Mixed experience", "Solid academics, average campus life", "Okay for the fees"],
  low: ["Not what was promised", "Placements need work", "Poor infrastructure", "Would not recommend", "Expensive for what you get"],
};

const REVIEW_LINES = {
  high: [
    "Most professors know their subject well and are approachable after class.",
    "The placement cell starts preparing students from the third year, which really helps.",
    "Labs are well equipped and we get access outside class hours.",
    "Hostel food is better than most colleges I visited.",
    "There are plenty of clubs, and the annual fest is a big deal.",
    "Seniors are helpful with internships and referrals.",
    "The library is open late and has most of the books we need.",
  ],
  mid: [
    "Teaching quality depends a lot on the department.",
    "Placements are good for the top branches, average for the rest.",
    "The campus is fine but the hostel rooms are cramped.",
    "Attendance rules are strict, which some students find frustrating.",
    "Fees are on the higher side, but scholarships are available.",
    "Wi-Fi is patchy in the hostels.",
  ],
  low: [
    "Several labs have outdated equipment.",
    "Very few companies visit for placements outside the top branch.",
    "Administration is slow to respond to any request.",
    "Hostel maintenance is poor and complaints take weeks.",
    "The fees keep increasing without any visible improvement.",
  ],
};

function reviewFor(rating: number) {
  const band = rating >= 4 ? "high" : rating === 3 ? "mid" : "low";
  const lines = [...sample(REVIEW_LINES[band], int(2, 3))];
  if (band === "high" && rand() < 0.4) lines.push(pick(REVIEW_LINES.mid));
  if (band === "low" && rand() < 0.4) lines.push(pick(REVIEW_LINES.mid));
  return { title: pick(REVIEW_TITLES[band]), body: lines.join(" ") };
}

// ---------- build ----------

async function main() {
  console.log("Clearing existing data…");
  await prisma.$transaction([
    prisma.savedComparison.deleteMany(),
    prisma.savedCollege.deleteMany(),
    prisma.review.deleteMany(),
    prisma.examCutoff.deleteMany(),
    prisma.placement.deleteMany(),
    prisma.course.deleteMany(),
    prisma.college.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const usedEmails = new Set<string>();
  const users: Prisma.UserCreateManyInput[] = Array.from({ length: USER_COUNT }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let email = `${slugify(firstName)}.${slugify(lastName)}@example.com`;
    if (usedEmails.has(email)) email = email.replace("@", `${index}@`);
    usedEmails.add(email);
    return { id: id(), email, name: `${firstName} ${lastName}`, passwordHash };
  });
  users.push({ id: id(), email: DEMO_EMAIL, name: "Demo Student", passwordHash });
  const reviewers = users.slice(0, USER_COUNT);

  const colleges: Prisma.CollegeCreateManyInput[] = [];
  const courses: Prisma.CourseCreateManyInput[] = [];
  const placements: Prisma.PlacementCreateManyInput[] = [];
  const cutoffs: Prisma.ExamCutoffCreateManyInput[] = [];
  const reviews: Prisma.ReviewCreateManyInput[] = [];
  const usedNames = new Set<string>();
  const qualities: { index: number; quality: number }[] = [];

  for (const { state, count, cities } of STATES) {
    for (let n = 0; n < count; n++) {
      const kind = weighted(KINDS).kind;
      const ownership = ownershipFor(kind);
      // The first city in each state is the big one and gets more colleges.
      const city = rand() < 0.5 ? cities[0]! : pick(cities);
      const quality = clamp(normal(ownership === Ownership.PUBLIC ? 0.58 : 0.48, 0.2), 0.02, 0.99);

      let name = `${pick(STEMS)} ${pick(SUFFIXES[kind])}`;
      while (usedNames.has(name)) name = `${pick(STEMS)} ${pick(SUFFIXES[kind])}`;
      usedNames.add(name);

      const collegeId = id();

      // Courses: 3–6, always including the flagship degree for the kind.
      const offered = COURSES[kind];
      const courseCount = int(3, 6);
      const collegeCourses: Prisma.CourseCreateManyInput[] = [];
      const flagship = offered[0]!;
      const chosen = new Set<string>();
      const addCourse = (degree: Degree, courseName: string) => {
        const key = `${degree}:${courseName}`;
        if (chosen.has(key)) return;
        chosen.add(key);
        const [low, high] = ANNUAL_FEES[degree][ownership];
        const annual = round(low + (high - low) * (0.35 * quality + 0.65 * rand()), 5_000);
        const durationYears = courseName === "Nursing" ? 4 : DURATION[degree];
        collegeCourses.push({
          id: id(),
          collegeId,
          name: courseName,
          degree,
          durationYears,
          totalFees: annual * durationYears,
          seats: degree === Degree.MBBS ? pick([100, 150, 200, 250]) : round(between(30, 180), 10),
        });
      };
      addCourse(flagship.degree, flagship.names[0]!);
      let guard = 0;
      while (collegeCourses.length < courseCount && guard++ < 50) {
        const group = pick(offered);
        addCourse(group.degree, pick(group.names));
      }
      courses.push(...collegeCourses);

      const annualFees = collegeCourses.map((course) => course.totalFees / course.durationYears);
      const degrees = [...new Set(collegeCourses.map((course) => course.degree))];

      // Placement
      const avg = oneDecimal(avgPackageFor(kind, quality) * between(0.9, 1.1));
      const placementRate = oneDecimal(clamp(50 + quality * 45 + between(-6, 6), 40, 99));
      const pools = RECRUITERS[RECRUITER_POOL[kind]];
      const topShare = Math.round(quality * 4);
      const recruiters = [
        ...sample(pools[0], topShare),
        ...sample(pools[1], int(2, 3)),
        ...sample(pools[2], int(2, 3)),
      ].slice(0, 8);
      placements.push({
        id: id(),
        collegeId,
        avgPackageLPA: avg,
        medianPackageLPA: oneDecimal(avg * between(0.78, 0.92)),
        highestPackageLPA: oneDecimal(avg * between(2.5, kind === "engineering" ? 6 : 4)),
        placementRate,
        topRecruiters: recruiters,
        year: PLACEMENT_YEAR,
      });

      // Exam cutoffs follow the degrees offered.
      const cutoff = (exam: Exam, closingRank: number) =>
        cutoffs.push({ id: id(), collegeId, exam, closingRank: Math.round(closingRank), year: PLACEMENT_YEAR });
      if (degrees.includes(Degree.BTECH)) {
        cutoff(Exam.JEE_MAIN, 1_500 + (1 - quality) ** 1.6 * 250_000);
        if (quality > 0.8 && ownership !== Ownership.PRIVATE) cutoff(Exam.JEE_ADV, 300 + (1 - quality) * 15_000);
      }
      if (degrees.includes(Degree.MTECH)) cutoff(Exam.GATE, 200 + (1 - quality) * 8_000);
      if (degrees.includes(Degree.MBA)) cutoff(Exam.CAT, 500 + (1 - quality) ** 1.5 * 80_000);
      if (degrees.includes(Degree.MBBS)) {
        cutoff(Exam.NEET, ownership === Ownership.PUBLIC ? 800 + (1 - quality) * 60_000 : 30_000 + (1 - quality) * 500_000);
      }

      // Reviews from distinct users, centred on a quality-driven target.
      const target = 2.9 + quality * 1.7;
      const collegeReviews = sample(reviewers, int(3, 8)).map((user) => {
        const rating = Math.round(clamp(normal(target, 0.8), 1, 5));
        return {
          id: id(),
          collegeId,
          userId: user.id!,
          rating,
          ...reviewFor(rating),
          createdAt: faker.date.between({ from: "2025-03-01", to: "2026-08-31" }),
        };
      });
      reviews.push(...collegeReviews);
      const ratingSum = collegeReviews.reduce((sum, review) => sum + review.rating, 0);

      const established =
        ownership === Ownership.PUBLIC ? int(1947, 2005) : ownership === Ownership.DEEMED ? int(1960, 2010) : int(1982, 2018);
      const totalSeats = collegeCourses.reduce((sum, course) => sum + course.seats, 0);
      const degreeList = degrees.map((degree) => DEGREE_TEXT[degree]).join(", ");

      const overview = [
        `${name} is a ${OWNERSHIP_WORD[ownership]} ${KIND_WORD[kind]} in ${city}, ${state}, established in ${established}. ${pick(STRENGTHS[kind])}`,
        `It offers ${collegeCourses.length} programmes (${degreeList}) with about ${totalSeats.toLocaleString("en-IN")} seats a year. ${pick(CAMPUS)}`,
        `In the ${PLACEMENT_YEAR} placement season, ${Math.round(placementRate)}% of eligible students received offers, with an average package of ${avg} LPA.`,
      ].join("\n\n");

      qualities.push({ index: colleges.length, quality });
      colleges.push({
        id: collegeId,
        slug: slugify(`${name} ${city}`),
        name,
        shortName: acronym(name),
        city,
        state,
        ownership,
        establishedYear: established,
        rating: Math.round((ratingSum / collegeReviews.length) * 100) / 100,
        ratingCount: collegeReviews.length,
        minFees: Math.min(...annualFees),
        maxFees: Math.max(...annualFees),
        overview,
        website: null,
        imageUrl: IMAGES[colleges.length % IMAGES.length]!,
        nirfRank: null,
      });
    }
  }

  // NIRF-style rank for the strongest 80, ordered by the hidden quality score.
  qualities
    .sort((a, b) => b.quality - a.quality)
    .slice(0, 80)
    .forEach(({ index }, rank) => {
      colleges[index]!.nirfRank = rank + 1;
    });

  if (colleges.length !== COLLEGE_COUNT) throw new Error(`Expected ${COLLEGE_COUNT} colleges, built ${colleges.length}`);

  console.log("Inserting…");
  await prisma.user.createMany({ data: users });
  await prisma.college.createMany({ data: colleges });
  await prisma.course.createMany({ data: courses });
  await prisma.placement.createMany({ data: placements });
  await prisma.examCutoff.createMany({ data: cutoffs });
  await prisma.review.createMany({ data: reviews });

  console.log(
    `Seeded ${users.length} users, ${colleges.length} colleges, ${courses.length} courses, ` +
      `${placements.length} placements, ${cutoffs.length} cutoffs, ${reviews.length} reviews.`,
  );
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

const DEGREE_TEXT: Record<Degree, string> = {
  BTECH: "B.Tech",
  MTECH: "M.Tech",
  MBA: "MBA",
  MBBS: "MBBS",
  BSC: "B.Sc",
  BCOM: "B.Com",
  BA: "BA",
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
