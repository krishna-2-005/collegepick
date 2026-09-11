"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api-client";
import type { SavedComparisonData } from "@/types/college";

export const savedComparisonsKey = ["saved", "comparisons"] as const;

export function useSavedComparisons() {
  const { status } = useSession();
  return useQuery({
    queryKey: savedComparisonsKey,
    queryFn: async ({ signal }) => (await apiFetch<SavedComparisonData[]>("/api/saved/comparisons", { signal })).data,
    enabled: status === "authenticated",
  });
}

export function useSaveComparison() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slugs: string[]) => {
      const response = await fetch("/api/saved/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs }),
      });
      // 201 = newly saved, 200 = this set was already saved.
      const created = response.status === 201;
      const body = (await response.json()) as { ok: boolean; error?: { message: string } };
      if (!body.ok) throw new Error(body.error?.message ?? "We couldn't save this comparison. Try again.");
      return { created };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: savedComparisonsKey }),
  });
}

/** Optimistic delete with rollback. */
export function useDeleteComparison() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/saved/comparisons?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: savedComparisonsKey });
      const previous = queryClient.getQueryData<SavedComparisonData[]>(savedComparisonsKey);
      queryClient.setQueryData<SavedComparisonData[]>(savedComparisonsKey, (current = []) =>
        current.filter((comparison) => comparison.id !== id),
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      queryClient.setQueryData(savedComparisonsKey, context?.previous);
      toast.error("Couldn't delete this comparison", { description: error.message });
    },
    onSuccess: () => toast.success("Comparison deleted"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: savedComparisonsKey }),
  });
}
