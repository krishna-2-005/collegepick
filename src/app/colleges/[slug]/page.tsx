import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlacementChartLazy as PlacementChart } from "@/components/college/detail/placement-chart-lazy";
import { ReviewsSection } from "@/components/college/detail/reviews-section";
import { SectionNav } from "@/components/college/detail/section-nav";
import { SaveButton } from "@/components/college/save-button";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { StatBlock } from "@/components/ui/stat-block";
import { DEGREE_LABELS, EXAM_LABELS, OWNERSHIP_LABELS } from "@/lib/constants";
import { formatCount, formatINR, formatLPA, formatPercent } from "@/lib/format";
import { getCollegeBySlug } from "@/server/colleges";
import type { CollegeCardData } from "@/types/college";

// Cached per college on first visit (ISR); publishing a review revalidates it on demand.
export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);
  if (!college) return { title: "College not found", robots: { index: false } };
  const description = `${college.name} in ${college.city}, ${college.state}: fees from ${formatINR(college.minFees)} a year, ${
    college.placement ? `average package ${formatLPA(college.placement.avgPackageLPA)}, ` : ""
  }rated ${college.rating.toFixed(1)} from ${college.ratingCount} reviews.`;
  return {
    title: college.name,
    description,
    alternates: { canonical: `/colleges/${college.slug}` },
    openGraph: { title: college.name, description, images: [{ url: college.imageUrl, width: 1600, height: 900 }] },
  };
}

function placementTone(rate: number) {
  if (rate >= 85) return "good" as const;
  if (rate < 60) return "warn" as const;
  return "default" as const;
}

export default async function CollegePage({ params }: Props) {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);
  if (!college) notFound();

  const { placement } = college;
  const card: CollegeCardData = {
    ...college,
    avgPackageLPA: placement?.avgPackageLPA ?? null,
    placementRate: placement?.placementRate ?? null,
  };
  const meta = [
    `${college.city}, ${college.state}`,
    OWNERSHIP_LABELS[college.ownership],
    `Est. ${college.establishedYear}`,
    college.nirfRank ? `NIRF #${college.nirfRank}` : null,
  ].filter(Boolean);

  return (
    <Container className="py-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
          <li>
            <Link href="/colleges" className="hover:text-ink hover:underline">
              Colleges
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/colleges?state=${encodeURIComponent(college.state)}`} className="hover:text-ink hover:underline">
              {college.state}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            {college.name}
          </li>
        </ol>
      </nav>

      <div className="relative mt-4 aspect-[21/9] overflow-hidden rounded-panel bg-line">
        <Image src={college.imageUrl} alt={`Campus of ${college.name}`} fill priority sizes="(min-width: 1248px) 1200px, 100vw" className="object-cover" />
      </div>

      <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl">{college.name}</h1>
          <p className="text-ink-muted">{meta.join(" · ")}</p>
        </div>
        <StarRating value={college.rating} count={college.ratingCount} countLabel="reviews" size="lg" className="shrink-0 md:pt-3" />
      </header>

      <div className="mt-5 mb-8 flex flex-wrap gap-2">
        <SaveButton college={card} variant="button" />
        <CompareToggle college={card} variant="button" />
        {college.website ? (
          <a href={college.website} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "ghost" })}>
            Visit website
            <ExternalLink aria-hidden className="size-4" />
          </a>
        ) : null}
      </div>

      <SectionNav />

      <section id="overview" aria-labelledby="overview-heading" className="scroll-mt-32 py-10">
        <h2 id="overview-heading" className="mb-6 text-2xl">
          Overview
        </h2>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex max-w-[70ch] flex-col gap-4 text-ink">
            {college.overview.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <Card className="grid grid-cols-2 gap-6 self-start">
            <StatBlock label="Fees from" value={`${formatINR(college.minFees)}/yr`} />
            <StatBlock label="Avg package" value={placement ? formatLPA(placement.avgPackageLPA) : "Not reported"} />
            <StatBlock
              label="Placement rate"
              value={placement ? formatPercent(placement.placementRate) : "Not reported"}
              tone={placement ? placementTone(placement.placementRate) : "default"}
            />
            <StatBlock label="Highest package" value={placement ? formatLPA(placement.highestPackageLPA) : "Not reported"} />
          </Card>
        </div>
        {college.cutoffs.length > 0 ? (
          <div className="mt-8 flex flex-col gap-3">
            <h3 className="text-lg">Entrance exams</h3>
            <ul className="flex flex-wrap gap-3">
              {college.cutoffs.map((cutoff) => (
                <li key={cutoff.exam} className="rounded-card border border-line bg-surface px-4 py-3">
                  <StatBlock
                    size="sm"
                    label={`${EXAM_LABELS[cutoff.exam]} closing rank, ${cutoff.year}`}
                    value={formatCount(cutoff.closingRank)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section id="courses" aria-labelledby="courses-heading" className="scroll-mt-32 border-t border-line py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <h2 id="courses-heading" className="text-2xl">
            Courses
          </h2>
          <span className="text-ink-muted">{college.courses.length} programmes</span>
        </div>
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-[0.9375rem]">
            <caption className="sr-only">Courses offered at {college.name}</caption>
            <thead className="border-b border-line text-sm text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Degree</th>
                <th scope="col" className="px-4 py-3 font-medium">Course</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Duration</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Total fees</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Per year</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Seats</th>
              </tr>
            </thead>
            <tbody>
              {college.courses.map((course) => (
                <tr key={course.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{DEGREE_LABELS[course.degree]}</td>
                  <td className="px-4 py-3">{course.name}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {course.durationYears} {course.durationYears === 1 ? "year" : "years"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatINR(course.totalFees)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-ink-muted">
                    {formatINR(Math.round(course.totalFees / course.durationYears))}
                  </td>
                  <td className="px-4 py-3 text-right">{formatCount(course.seats)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="placements" aria-labelledby="placements-heading" className="scroll-mt-32 border-t border-line py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <h2 id="placements-heading" className="text-2xl">
            Placements
          </h2>
          {placement ? <span className="text-ink-muted">{placement.year} season</span> : null}
        </div>
        {placement ? (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <StatBlock size="lg" label="Average package" value={formatLPA(placement.avgPackageLPA)} />
              <StatBlock size="lg" label="Median package" value={formatLPA(placement.medianPackageLPA)} />
              <StatBlock size="lg" label="Highest package" value={formatLPA(placement.highestPackageLPA)} />
              <StatBlock
                size="lg"
                label="Students placed"
                value={formatPercent(placement.placementRate)}
                tone={placementTone(placement.placementRate)}
              />
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card>
                <PlacementChart placement={placement} />
              </Card>
              <Card className="flex flex-col gap-3 self-start">
                <h3 className="text-lg">Top recruiters</h3>
                <ul className="flex flex-wrap gap-2">
                  {placement.topRecruiters.map((recruiter) => (
                    <li key={recruiter}>
                      <Badge className="h-8 px-3 text-sm text-ink">{recruiter}</Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        ) : (
          <p className="text-ink-muted">This college hasn&apos;t reported placement data yet.</p>
        )}
      </section>

      <section id="reviews" aria-label="Reviews" className="scroll-mt-32 border-t border-line py-10">
        <ReviewsSection
          slug={college.slug}
          collegeName={college.name}
          rating={college.rating}
          ratingCount={college.ratingCount}
          distribution={college.ratingDistribution}
          reviews={college.reviews}
          nextCursor={college.reviewsNextCursor}
        />
      </section>
    </Container>
  );
}
