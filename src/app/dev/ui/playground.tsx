"use client";

import { GitCompareArrows, Heart, Info, Search, SearchX } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip, LinkChip, RemovableChip } from "@/components/ui/chip";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { RangeSlider, type Range } from "@/components/ui/range-slider";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating, StarRatingInput, StarRow } from "@/components/ui/star-rating";
import { StatBlock } from "@/components/ui/stat-block";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import { formatFeeRange, formatINR, formatLPA, formatPercent } from "@/lib/format";

const colors = [
  { token: "--bg", hex: "#F7F8FA", use: "Page background" },
  { token: "--surface", hex: "#FFFFFF", use: "Cards, panels" },
  { token: "--ink", hex: "#14213D", use: "Primary text" },
  { token: "--ink-muted", hex: "#5B6478", use: "Secondary text" },
  { token: "--line", hex: "#E3E6EC", use: "Borders, dividers" },
  { token: "--accent", hex: "#1F5EFF", use: "Actions, links, active filter" },
  { token: "--accent-soft", hex: "#E8EEFF", use: "Selected chips" },
  { token: "--good", hex: "#12805C", use: "Best in row, high placement" },
  { token: "--warn", hex: "#B45309", use: "Warnings, destructive actions" },
  { token: "--gold", hex: "#C99A2E", use: "Rating stars only" },
];

const typeScale = [
  { size: "text-4xl", px: 52, font: "font-display font-bold", sample: "Compare colleges" },
  { size: "text-3xl", px: 36, font: "font-display font-bold", sample: "IIIT Bangalore" },
  { size: "text-2xl", px: 28, font: "font-display font-bold", sample: "Placements" },
  { size: "text-xl", px: 22, font: "font-display font-medium", sample: "Top rated this year" },
  { size: "text-lg", px: 18, font: "font-sans font-medium", sample: "B.Tech Computer Science" },
  { size: "text-base", px: 16, font: "font-sans", sample: "Body text sits at 16px with 1.6 line height." },
  { size: "text-sm", px: 14, font: "font-sans", sample: "Labels and secondary text" },
  { size: "text-xs", px: 12, font: "font-sans", sample: "Fine print and axis labels" },
];

const states = ["Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Telangana"];

const cityOptions = [
  { value: "bengaluru", label: "Bengaluru" },
  { value: "chennai", label: "Chennai" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "mumbai", label: "Mumbai" },
  { value: "pune", label: "Pune" },
];

const sortOptions = [
  { value: "rating", label: "Rating" },
  { value: "fees-asc", label: "Fees: low to high" },
  { value: "package", label: "Average package" },
];

export function Playground() {
  const [selectedStates, setSelectedStates] = useState<string[]>(["Karnataka"]);
  const [activeFilters, setActiveFilters] = useState(["Karnataka", "B.Tech", "Under ₹2L/yr"]);
  const [fees, setFees] = useState<Range>([100_000, 1_200_000]);
  const [rating, setRating] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleState = (state: string, selected: boolean) =>
    setSelectedStates((current) =>
      selected ? [...current, state] : current.filter((item) => item !== state),
    );

  const fakeSave = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast.success("College saved", { description: "Find it any time under Saved." });
    }, 1200);
  };

  return (
    <div className="mt-12 flex flex-col gap-16">
      <Section title="Color tokens" note="Defined in globals.css. Tailwind's default palette is removed.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {colors.map((color) => (
            <Card key={color.token} padding="none" className="overflow-hidden">
              <div className="h-16 border-b border-line" style={{ backgroundColor: `var(${color.token})` }} />
              <div className="flex flex-col gap-0.5 p-3">
                <span className="text-sm font-medium">{color.token}</span>
                <span className="text-xs text-ink-muted">{color.hex}</span>
                <span className="text-xs text-ink-muted">{color.use}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Typography" note="Bricolage Grotesque for headings, Inter for body, UI and numbers.">
        <Card padding="none">
          {typeScale.map((row) => (
            <div
              key={row.size}
              className="flex flex-col gap-1 border-b border-line px-5 py-4 last:border-b-0 md:flex-row md:items-baseline md:gap-8"
            >
              <span className="w-24 shrink-0 text-xs text-ink-muted">{row.px}px</span>
              <span className={`${row.size} ${row.font} min-w-0`}>{row.sample}</span>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Button" note="Primary, secondary, ghost, danger in two sizes, plus loading and disabled.">
        <div className="flex flex-col gap-4">
          <Row>
            <Button>Compare 3 colleges</Button>
            <Button variant="secondary">Write a review</Button>
            <Button variant="ghost">Clear all</Button>
            <Button variant="danger">Delete comparison</Button>
          </Row>
          <Row>
            <Button size="sm">Load 12 more</Button>
            <Button size="sm" variant="secondary" icon={<Heart className="size-4" aria-hidden />}>
              Save college
            </Button>
            <Button size="sm" variant="ghost" icon={<GitCompareArrows className="size-4" aria-hidden />}>
              Add to compare
            </Button>
            <Button size="sm" variant="danger">
              Remove
            </Button>
          </Row>
          <Row>
            <Button loading={loading} loadingText="Saving college…" onClick={fakeSave}>
              Save college
            </Button>
            <Button disabled>Compare 1 college</Button>
          </Row>
        </div>
      </Section>

      <Section title="Input, Select, Checkbox">
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Search colleges"
            placeholder="Search colleges, cities, courses"
            icon={<Search aria-hidden />}
          />
          <Input label="Email" type="email" placeholder="you@example.com" hint="We'll never share it." />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            defaultValue="short"
            error="Use at least 8 characters."
            trailing={
              <Button size="sm" variant="ghost" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? "Hide" : "Show"}
              </Button>
            }
          />
          <Input label="Disabled" disabled defaultValue="Not editable" />
          <Select label="City" placeholder="Any city" options={cityOptions} />
          <Select label="Sort by" options={sortOptions} defaultValue="rating" />
          <div className="flex flex-col">
            <Checkbox label="Public" defaultChecked />
            <Checkbox label="Private" />
            <Checkbox label="Deemed" description="Deemed-to-be universities set their own syllabus." />
            <Checkbox label="Disabled option" disabled />
          </div>
        </div>
      </Section>

      <Section title="Chip" note="Toggle chips for filters, link chips for navigation, removable chips for active filters.">
        <div className="flex flex-col gap-5">
          <Row>
            {states.map((state, index) => (
              <Chip
                key={state}
                selected={selectedStates.includes(state)}
                onSelectedChange={(selected) => toggleState(state, selected)}
                count={[18, 24, 21, 12, 15][index]}
              >
                {state}
              </Chip>
            ))}
          </Row>
          <Row>
            <span className="text-sm text-ink-muted">Popular:</span>
            <LinkChip href="/dev/ui">JEE Main</LinkChip>
            <LinkChip href="/dev/ui">NEET</LinkChip>
            <LinkChip href="/dev/ui">Bengaluru</LinkChip>
          </Row>
          <Row>
            {activeFilters.map((filter) => (
              <RemovableChip
                key={filter}
                onRemove={() => setActiveFilters((current) => current.filter((item) => item !== filter))}
              >
                {filter}
              </RemovableChip>
            ))}
            {activeFilters.length > 0 ? (
              <Button size="sm" variant="ghost" onClick={() => setActiveFilters([])}>
                Clear all
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setActiveFilters(["Karnataka", "B.Tech", "Under ₹2L/yr"])}
              >
                Reset filters
              </Button>
            )}
          </Row>
        </div>
      </Section>

      <Section title="RangeSlider" note="Dual thumbs on native range inputs. Arrow keys move a thumb one step.">
        <Card className="max-w-sm">
          <RangeSlider
            label="Fees per year"
            min={0}
            max={2_500_000}
            step={50_000}
            value={fees}
            onValueChange={setFees}
            format={formatINR}
            thumbLabels={["Minimum fees", "Maximum fees"]}
          />
        </Card>
      </Section>

      <Section title="Card, StatBlock, StarRating, Badge">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Deemed</Badge>
              <Badge tone="accent">NIRF #74</Badge>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg">IIIT Bangalore</h3>
              <p className="text-sm text-ink-muted">Bengaluru, Karnataka</p>
              <StarRating value={4.4} count={318} />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
              <StatBlock size="sm" label="Fees per year" value={formatFeeRange(120_000, 240_000)} />
              <StatBlock size="sm" label="Avg package" value={formatLPA(18.5)} />
            </div>
          </Card>
          <Card className="grid grid-cols-2 gap-6">
            <StatBlock label="Avg package" value={formatLPA(18.5)} tone="good" hint="2024 batch" />
            <StatBlock label="Placement rate" value={formatPercent(58)} tone="warn" />
            <StatBlock label="Fees from" value={formatINR(240_000)} />
            <StatBlock label="Highest package" value={formatLPA(62)} />
          </Card>
          <Card className="flex flex-col gap-4">
            <StatBlock size="lg" label="Highest package" value={formatLPA(62)} />
            <StarRating value={4.1} count={1} countLabel="reviews" size="lg" />
            <StarRating value={3.8} count={212} size="sm" />
            <div className="flex flex-wrap gap-2">
              <Badge tone="good">Best</Badge>
              <Badge tone="warn">Low placement rate</Badge>
              <Badge tone="solid">3</Badge>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="StarRating input, StarRow, Textarea" note="Five native radios, so arrow keys change the rating.">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <StarRatingInput label="Your rating" value={rating} onValueChange={setRating} />
            <StarRow value={4} />
          </div>
          <Textarea label="Your review" hint="At least 30 characters." placeholder="Faculty, placements, campus life…" />
        </div>
      </Section>

      <Section title="Skeleton" note="Static, same size as the card it stands in for, so nothing shifts when data arrives.">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex flex-col gap-4">
            <Skeleton className="aspect-video w-full rounded-control" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Tabs" note="Arrow keys move between tabs; Home and End jump to the ends.">
        <Tabs
          label="Saved items"
          items={[
            {
              value: "colleges",
              label: "Saved colleges",
              count: 4,
              content: <p className="text-ink-muted">Your saved colleges appear here.</p>,
            },
            {
              value: "comparisons",
              label: "Saved comparisons",
              count: 2,
              content: <p className="text-ink-muted">Your saved comparisons appear here.</p>,
            },
          ]}
        />
      </Section>

      <Section title="Dialog, Drawer, Tooltip, Toast">
        <Row>
          <Button onClick={() => setDialogOpen(true)}>Write a review</Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Filters (3)
          </Button>
          <Tooltip content="Placement rate is the share of eligible students who got an offer.">
            <button
              type="button"
              aria-label="About placement rate"
              className="flex size-10 items-center justify-center rounded-control text-ink-muted hover:bg-line/60 hover:text-ink"
            >
              <Info aria-hidden className="size-5" />
            </button>
          </Tooltip>
          <Button variant="secondary" onClick={() => toast.success("Review published")}>
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.error("You can compare up to 3 colleges", { description: "Remove one to add another." })}
          >
            Error toast
          </Button>
        </Row>

        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Write a review"
          description="Share what studying at IIIT Bangalore is really like."
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  toast.success("Review published");
                }}
              >
                Publish review
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <StarRatingInput label="Your rating" value={rating} onValueChange={setRating} />
            <Input label="Title" placeholder="Strong placements, heavy workload" />
          </div>
        </Dialog>

        <Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="Filters"
          footer={
            <>
              <Button variant="secondary" className="flex-1" onClick={() => setSelectedStates([])}>
                Clear all
              </Button>
              <Button className="flex-1" onClick={() => setDrawerOpen(false)}>
                Show 184 colleges
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">State</span>
              <div className="flex flex-wrap gap-2">
                {states.map((state) => (
                  <Chip
                    key={state}
                    selected={selectedStates.includes(state)}
                    onSelectedChange={(selected) => toggleState(state, selected)}
                  >
                    {state}
                  </Chip>
                ))}
              </div>
            </div>
            <RangeSlider
              label="Fees per year"
              min={0}
              max={2_500_000}
              step={50_000}
              value={fees}
              onValueChange={setFees}
              format={formatINR}
              thumbLabels={["Minimum fees", "Maximum fees"]}
            />
          </div>
        </Drawer>
      </Section>

      <Section title="Avatar">
        <Row>
          <Avatar name="IIIT Bangalore" size="sm" />
          <Avatar name="PES University" />
          <Avatar name="RV College of Engineering" size="lg" />
        </Row>
      </Section>

      <Section title="EmptyState" note="No illustration. Always offers the next action.">
        <EmptyState
          icon={<SearchX />}
          title="No colleges match"
          description="Clear filters or widen the fee range."
          action={<Button variant="secondary">Clear filters</Button>}
        />
      </Section>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 border-b border-line pb-3">
        <h2 className="text-xl">{title}</h2>
        {note ? <p className="text-sm text-ink-muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}
