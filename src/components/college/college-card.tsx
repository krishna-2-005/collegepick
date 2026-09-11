import Image from "next/image";
import Link from "next/link";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { StatBlock } from "@/components/ui/stat-block";
import { OWNERSHIP_LABELS } from "@/lib/constants";
import { formatFeeRange, formatLPA } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CollegeCardData } from "@/types/college";
import { SaveButton } from "./save-button";

type CollegeCardProps = {
  college: CollegeCardData;
  /** Set on the first row of a page so the LCP image isn't lazy-loaded. */
  priority?: boolean;
  className?: string;
};

/**
 * The whole card is a link (a stretched ::after on the name), while the save and
 * compare buttons sit above it, so there are no buttons nested inside an <a>.
 */
export function CollegeCard({ college, priority = false, className }: CollegeCardProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-card border border-line bg-surface hover:border-ink-muted",
        className,
      )}
    >
      <div className="relative aspect-video bg-line">
        <Image
          src={college.imageUrl}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        {college.nirfRank ? (
          <Badge className="absolute top-3 left-3 border border-line bg-surface text-ink">NIRF #{college.nirfRank}</Badge>
        ) : null}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <SaveButton college={college} />
          <CompareToggle college={college} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-lg leading-snug">
            {/* The stretched ::after covers the card and carries the focus ring, card-shaped. */}
            <Link
              href={`/colleges/${college.slug}`}
              className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
            >
              {college.name}
            </Link>
          </h3>
          <p className="text-sm text-ink-muted">
            {college.city}, {college.state} · {OWNERSHIP_LABELS[college.ownership]}
          </p>
        </div>
        <StarRating value={college.rating} count={college.ratingCount} size="sm" />
        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-line pt-3">
          <StatBlock size="sm" label="Fees per year" value={formatFeeRange(college.minFees, college.maxFees)} />
          <StatBlock
            size="sm"
            label="Avg package"
            value={college.avgPackageLPA !== null ? formatLPA(college.avgPackageLPA) : "Not reported"}
          />
        </div>
      </div>
    </article>
  );
}

/** Same box as CollegeCard so swapping skeletons for cards never shifts the layout. */
export function CollegeCardSkeleton() {
  return (
    <Card padding="none" className="flex flex-col overflow-hidden" aria-hidden>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-2 gap-4 border-t border-line pt-3">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      </div>
    </Card>
  );
}

export function CollegeGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>{children}</div>;
}
