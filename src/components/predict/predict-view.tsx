"use client";

import { useQuery } from "@tanstack/react-query";
import { Target, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useState, type FormEvent } from "react";
import { SaveButton } from "@/components/college/save-button";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatBlock } from "@/components/ui/stat-block";
import { apiFetch } from "@/lib/api-client";
import { EXAMS, EXAM_LABELS, OWNERSHIP_LABELS } from "@/lib/constants";
import { fieldErrors } from "@/lib/form-errors";
import { formatCount, formatFeeRange, formatLPA } from "@/lib/format";
import { predictQuerySchema } from "@/lib/validations/predict";
import type { PredictBand, PredictResponse, PredictResult } from "@/types/college";

const parsers = {
  exam: parseAsStringLiteral(EXAMS),
  rank: parseAsInteger,
  state: parseAsString,
};

const BANDS: { band: PredictBand; title: string; description: string; tone: BadgeTone }[] = [
  { band: "reach", title: "Reach", description: "Closed slightly better than your rank last year. Worth a try.", tone: "warn" },
  { band: "good", title: "Good chance", description: "Your rank is within the closing rank.", tone: "accent" },
  { band: "safe", title: "Safe", description: "Closed well beyond your rank.", tone: "good" },
];

const examOptions = EXAMS.map((exam) => ({ value: exam, label: EXAM_LABELS[exam] }));

export function PredictView({ states }: { states: string[] }) {
  const [params, setParams] = useQueryStates(parsers, { history: "push", scroll: false });
  const [draft, setDraft] = useState({
    exam: params.exam ?? "",
    rank: params.rank ? String(params.rank) : "",
    state: params.state ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ready = params.exam !== null && params.rank !== null;
  const queryString = new URLSearchParams({
    exam: params.exam ?? "",
    rank: String(params.rank ?? ""),
    ...(params.state ? { state: params.state } : {}),
  }).toString();

  const query = useQuery({
    queryKey: ["predict", queryString],
    queryFn: async ({ signal }) => (await apiFetch<PredictResponse>(`/api/predict?${queryString}`, { signal })).data,
    enabled: ready,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = predictQuerySchema.safeParse({
      exam: draft.exam || undefined,
      rank: draft.rank.replace(/[,\s]/g, "") || undefined,
      state: draft.state || undefined,
    });
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }
    setErrors({});
    void setParams({ exam: result.data.exam, rank: result.data.rank, state: result.data.state ?? null });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-[70ch] flex-col gap-2">
        <h1 className="text-2xl md:text-3xl">Predict your colleges</h1>
        <p className="text-ink-muted">
          Enter your entrance exam and rank to see colleges whose last closing rank is close to or beyond yours.
        </p>
      </div>

      <Card className="p-5 md:p-6">
        <form onSubmit={submit} noValidate className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-start">
          <Select
            label="Exam"
            placeholder="Choose an exam"
            options={examOptions}
            value={draft.exam}
            onChange={(event) => setDraft({ ...draft, exam: event.target.value })}
            error={errors.exam}
          />
          <Input
            label="Your rank"
            inputMode="numeric"
            placeholder="e.g. 12000"
            value={draft.rank}
            onChange={(event) => setDraft({ ...draft, rank: event.target.value })}
            error={errors.rank}
          />
          <Select
            label="State (optional)"
            placeholder="Any state"
            options={states.map((state) => ({ value: state, label: state }))}
            value={draft.state}
            onChange={(event) => setDraft({ ...draft, state: event.target.value })}
          />
          <Button type="submit" className="md:mt-7">
            Find colleges
          </Button>
        </form>
      </Card>

      {!ready ? (
        <EmptyState
          icon={<Target />}
          title="Enter your exam and rank"
          description="Results are grouped into reach, good chance and safe, based on 2025 closing ranks."
        />
      ) : query.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-card" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          icon={<TriangleAlert />}
          title="We couldn't run the prediction"
          description={query.error.message}
          action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        />
      ) : (
        <Results data={query.data} exam={params.exam!} rank={params.rank!} state={params.state} />
      )}

      <p className="text-sm text-ink-muted">
        Closing ranks change every year and depend on category, quota and round. Treat this as a
        starting point and check each college&apos;s official cutoffs. College data here is sample data.
      </p>
    </div>
  );
}

function Results({
  data,
  exam,
  rank,
  state,
}: {
  data: PredictResponse;
  exam: (typeof EXAMS)[number];
  rank: number;
  state: string | null;
}) {
  const total = data.counts.reach + data.counts.good + data.counts.safe;
  if (total === 0) {
    return (
      <EmptyState
        icon={<Target />}
        title="No colleges near this rank"
        description={
          state
            ? `No ${EXAM_LABELS[exam]} colleges in ${state} close within reach of rank ${formatCount(rank)}. Try any state.`
            : `No college's ${EXAM_LABELS[exam]} closing rank is within reach of ${formatCount(rank)}. Check the rank, or try another exam.`
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="text-lg" role="status">
        {EXAM_LABELS[exam]} rank {formatCount(rank)}
        {state ? ` in ${state}` : ""}: <strong>{data.counts.reach}</strong> reach,{" "}
        <strong>{data.counts.good}</strong> good chance, <strong>{data.counts.safe}</strong> safe.
      </p>
      {BANDS.map(({ band, title, description, tone }) => {
        const rows = data.results.filter((result) => result.band === band);
        const count = data.counts[band];
        return (
          <section key={band} aria-labelledby={`band-${band}`} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 id={`band-${band}`} className="text-xl md:text-2xl">
                {title}
              </h2>
              <Badge tone={tone}>{formatCount(count)}</Badge>
              <p className="w-full text-sm text-ink-muted md:w-auto">{description}</p>
            </div>
            {rows.length === 0 ? (
              <p className="text-ink-muted">None at this rank.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {rows.map((result) => (
                  <li key={result.college.id}>
                    <ResultRow result={result} rank={rank} />
                  </li>
                ))}
              </ul>
            )}
            {count > rows.length ? (
              <p className="text-sm text-ink-muted">
                Showing the {rows.length} most competitive of {formatCount(count)}. Pick a state to narrow the list.
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function ResultRow({ result, rank }: { result: PredictResult; rank: number }) {
  const { college, closingRank, year } = result;
  const margin = closingRank - rank;
  return (
    <Card className="grid gap-4 sm:grid-cols-[4.5rem_1fr] md:grid-cols-[4.5rem_1.6fr_1fr_1fr_1fr_auto] md:items-center">
      <span className="relative hidden aspect-square overflow-hidden rounded-control bg-line sm:block">
        <Image src={college.imageUrl} alt="" fill sizes="72px" className="object-cover" />
      </span>
      <div className="flex min-w-0 flex-col">
        <Link href={`/colleges/${college.slug}`} className="font-display text-lg leading-snug font-bold hover:underline">
          {college.name}
        </Link>
        <span className="text-sm text-ink-muted">
          {college.city}, {college.state} · {OWNERSHIP_LABELS[college.ownership]}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 sm:col-span-2 md:contents">
        <StatBlock
          size="sm"
          label={`Closing rank, ${year}`}
          value={formatCount(closingRank)}
          hint={margin >= 0 ? `${formatCount(margin)} beyond yours` : `${formatCount(-margin)} better than yours`}
        />
        <StatBlock size="sm" label="Fees per year" value={formatFeeRange(college.minFees, college.maxFees)} />
        <StatBlock
          size="sm"
          label="Avg package"
          value={college.avgPackageLPA !== null ? formatLPA(college.avgPackageLPA) : "Not reported"}
        />
      </div>
      <div className="flex gap-2 sm:col-span-2 md:col-span-1">
        <SaveButton college={college} />
        <CompareToggle college={college} />
      </div>
    </Card>
  );
}
