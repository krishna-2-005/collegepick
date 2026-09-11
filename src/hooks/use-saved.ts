"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api-client";
import type { CollegeCardData, SavedCollegeData } from "@/types/college";

export const savedCollegesKey = ["saved", "colleges"] as const;

export function useSavedColleges() {
  const { status } = useSession();
  return useQuery({
    queryKey: savedCollegesKey,
    queryFn: async ({ signal }) => (await apiFetch<SavedCollegeData[]>("/api/saved/colleges", { signal })).data,
    enabled: status === "authenticated",
  });
}

/** Sends logged-out users to login with a way back to the current page. */
export function useLoginRedirect() {
  const router = useRouter();
  return useCallback(
    (message: string) => {
      // Read at click time: useSearchParams would force a Suspense boundary on static pages.
      const next = `${window.location.pathname}${window.location.search}`;
      toast.info(message);
      router.push(`/login?next=${encodeURIComponent(next)}`);
    },
    [router],
  );
}

/** Save/unsave with an optimistic update; rolls back and explains on failure. */
export function useToggleSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ college, save }: { college: CollegeCardData; save: boolean }) => {
      if (save) await apiFetch("/api/saved/colleges", { method: "POST", json: { collegeId: college.id } });
      else await apiFetch(`/api/saved/colleges?collegeId=${encodeURIComponent(college.id)}`, { method: "DELETE" });
    },
    onMutate: async ({ college, save }) => {
      await queryClient.cancelQueries({ queryKey: savedCollegesKey });
      const previous = queryClient.getQueryData<SavedCollegeData[]>(savedCollegesKey);
      queryClient.setQueryData<SavedCollegeData[]>(savedCollegesKey, (current = []) =>
        save
          ? [{ ...college, savedAt: new Date().toISOString() }, ...current.filter((item) => item.id !== college.id)]
          : current.filter((item) => item.id !== college.id),
      );
      return { previous };
    },
    onError: (error, { save }, context) => {
      queryClient.setQueryData(savedCollegesKey, context?.previous);
      toast.error(save ? "Couldn't save this college" : "Couldn't remove this college", {
        description: error.message,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: savedCollegesKey }),
  });
}
