import { CollegeCard, CollegeGrid } from "@/components/college/college-card";
import { CollegeSearch } from "@/components/college/college-search";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section-header";
import { LinkChip } from "@/components/ui/chip";
import { getFilterOptions, listColleges } from "@/server/colleges";

// Featured rows and state counts change slowly; rebuild hourly (reviews also revalidate "/").
export const revalidate = 3600;

const popular = [
  { label: "JEE Main", href: "/colleges?exam=JEE_MAIN" },
  { label: "NEET", href: "/colleges?exam=NEET" },
  { label: "CAT", href: "/colleges?exam=CAT" },
  { label: "Bengaluru", href: "/colleges?city=Bengaluru" },
  { label: "Under ₹2L/yr", href: "/colleges?maxFees=200000" },
];

export default async function HomePage() {
  const [filters, topRated, bestPlacements] = await Promise.all([
    getFilterOptions(),
    listColleges({ sort: "rating", limit: 6 }),
    listColleges({ sort: "package", limit: 6 }),
  ]);

  return (
    <Container className="flex flex-col gap-16 py-8 md:py-12">
      <section className="rounded-panel border border-line bg-surface px-5 py-10 md:px-12 md:py-14">
        <h1 className="max-w-[20ch] text-3xl md:text-4xl">Find the college that fits you, not just the one that ranks.</h1>
        <div className="mt-8 max-w-2xl">
          <CollegeSearch submitToListing size="lg" />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-ink-muted">Popular:</span>
          {popular.map((item) => (
            <LinkChip key={item.label} href={item.href}>
              {item.label}
            </LinkChip>
          ))}
        </div>
      </section>

      <section aria-labelledby="states-heading" className="flex flex-col gap-5">
        <SectionHeader id="states-heading" title="Browse by state" />
        <div className="flex flex-wrap gap-2">
          {filters.states.slice(0, 12).map((state) => (
            <LinkChip key={state.value} href={`/colleges?state=${encodeURIComponent(state.value)}`} count={state.count}>
              {state.value}
            </LinkChip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader title="Top rated this year" href="/colleges?sort=rating" linkLabel="See all by rating" />
        <CollegeGrid>
          {topRated.items.map((college, index) => (
            <CollegeCard key={college.id} college={college} priority={index < 3} />
          ))}
        </CollegeGrid>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader title="Best placements" href="/colleges?sort=package" linkLabel="See all by package" />
        <CollegeGrid>
          {bestPlacements.items.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </CollegeGrid>
      </section>
    </Container>
  );
}
