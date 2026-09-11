"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GitCompareArrows, Link2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { CollegeSearch } from "@/components/college/college-search";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { useCompareHydrated } from "@/hooks/use-compare-hydrated";
import { useSaveComparison } from "@/hooks/use-saved-comparisons";
import { useLoginRedirect } from "@/hooks/use-saved";
import { apiFetch } from "@/lib/api-client";
import { MAX_COMPARE } from "@/lib/constants";
import { useCompareStore } from "@/store/compare";
import type { CollegeCardData, CompareCollege } from "@/types/college";
import { CompareRadarLazy } from "./compare-radar-lazy";
import { CompareTable } from "./compare-table";

export type InitialCompare = { key: string; colleges: CompareCollege[] | null; error: string | null };

const idsParser = parseAsArrayOf(parseAsString).withDefault([]).withOptions({ history: "push", scroll: false });

export function CompareView({ initial }: { initial: InitialCompare }) {
  const router = useRouter();
  const { status } = useSession();
  const redirectToLogin = useLoginRedirect();
  const [ids, setIds] = useQueryState("ids", idsParser);
  const key = ids.join(",");
  const hydrated = useCompareHydrated();
  const storeItems = useCompareStore((state) => state.items);
  const replaceStore = useCompareStore((state) => state.replace);
  const removeFromStore = useCompareStore((state) => state.remove);
  const clearStore = useCompareStore((state) => state.clear);
  const saveComparison = useSaveComparison();
  const [addOpen, setAddOpen] = useState(false);

  // Opening /compare with no ids shows this tab's current selection instead of an empty page.
  const restored = useRef(false);
  useEffect(() => {
    if (!hydrated || restored.current) return;
    restored.current = true;
    if (ids.length === 0 && storeItems.length > 0) void setIds(storeItems.map((item) => item.slug), { history: "replace" });
  }, [hydrated, ids.length, storeItems, setIds]);

  const query = useQuery({
    queryKey: ["compare", key],
    queryFn: async ({ signal }) =>
      (await apiFetch<CompareCollege[]>(`/api/colleges/compare?ids=${encodeURIComponent(key)}`, { signal })).data,
    enabled: ids.length >= 2,
    initialData: initial.key === key && initial.colleges ? initial.colleges : undefined,
    placeholderData: keepPreviousData,
  });

  // With one id there's nothing to compare yet; fetch just enough to name it.
  const single = useQuery({
    queryKey: ["compare-single", ids[0]],
    queryFn: async ({ signal }) => (await apiFetch<CollegeCardData>(`/api/colleges/${ids[0]}`, { signal })).data,
    enabled: ids.length === 1,
  });

  // The URL is the source of truth on this page; mirror it into the compare bar's store.
  const colleges = ids.length >= 2 ? query.data : undefined;
  useEffect(() => {
    if (colleges && !query.isPlaceholderData) replaceStore(colleges);
  }, [colleges, query.isPlaceholderData, replaceStore]);

  function add(college: CollegeCardData) {
    setAddOpen(false);
    if (ids.includes(college.slug)) return;
    if (ids.length >= MAX_COMPARE) {
      toast.error(`You can compare up to ${MAX_COMPARE} colleges`, { description: "Remove one to add another." });
      return;
    }
    const current = useCompareStore.getState().items;
    if (!current.some((item) => item.slug === college.slug)) useCompareStore.getState().toggle(college);
    void setIds([...ids, college.slug]);
  }

  function remove(slug: string) {
    removeFromStore(slug);
    const next = ids.filter((id) => id !== slug);
    void setIds(next.length > 0 ? next : null);
  }

  function clearAll() {
    clearStore();
    void setIds(null);
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied", { description: "Anyone with the link sees this comparison." });
    } catch {
      toast.error("Couldn't copy the link", { description: "Copy it from the address bar instead." });
    }
  }

  function save() {
    if (status !== "authenticated") {
      redirectToLogin("Log in to save comparisons.");
      return;
    }
    saveComparison.mutate(ids, {
      onSuccess: ({ created }) =>
        toast.success(created ? "Comparison saved" : "Already in your saved comparisons", {
          action: { label: "View saved", onClick: () => router.push("/saved?tab=comparisons") },
        }),
      onError: (error) => toast.error("Couldn't save this comparison", { description: error.message }),
    });
  }

  const addDialog = (
    <Dialog open={addOpen} onOpenChange={setAddOpen} title="Add a college" description="Search by name, city or course.">
      <div className="min-h-72">
        <CollegeSearch onSelect={add} exclude={ids} autoFocus listPosition="inline" label="Search colleges to add" />
      </div>
    </Dialog>
  );

  const ready = Boolean(colleges && colleges.length >= 2);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl">Compare colleges</h1>
          <p className="text-ink-muted">
            {ready ? `${colleges!.length} colleges side by side. The best value in each row is marked.` : "Pick two or three colleges."}
          </p>
        </div>
        {ready ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Link2 aria-hidden className="size-4.5" />} onClick={() => void share()}>
              Share link
            </Button>
            <Button loading={saveComparison.isPending} loadingText="Saving…" onClick={save}>
              Save comparison
            </Button>
          </div>
        ) : null}
      </div>

      {ids.length === 0 ? (
        <EmptyState
          icon={<GitCompareArrows />}
          title="Nothing to compare yet"
          description="Add two or three colleges from the list, or search for them here."
          action={
            <>
              <Button onClick={() => setAddOpen(true)}>Add a college</Button>
              <ButtonLink href="/colleges" variant="secondary">
                Browse colleges
              </ButtonLink>
            </>
          }
        />
      ) : ids.length === 1 ? (
        <EmptyState
          icon={<GitCompareArrows />}
          title={single.data ? `Add a college to compare with ${single.data.name}` : "Add one more college"}
          description="A comparison needs at least two colleges."
          action={
            <>
              <Button onClick={() => setAddOpen(true)}>Add a college</Button>
              <Button variant="secondary" onClick={clearAll}>
                Start over
              </Button>
            </>
          }
        />
      ) : query.isError && !query.data ? (
        <EmptyState
          icon={<TriangleAlert />}
          title="This comparison can't be shown"
          description={query.error.message}
          action={
            <Button variant="secondary" onClick={clearAll}>
              Start a new comparison
            </Button>
          }
        />
      ) : !colleges ? (
        <Card padding="lg" className="text-center text-ink-muted" aria-busy="true">
          Loading comparison…
        </Card>
      ) : (
        <>
          <CompareTable colleges={colleges} onRemove={remove} onAdd={() => setAddOpen(true)} />
          <Card padding="lg">
            <h2 className="mb-2 text-xl">At a glance</h2>
            <CompareRadarLazy colleges={colleges} />
          </Card>
        </>
      )}

      {addDialog}
    </div>
  );
}
