"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { CollegeCardData } from "@/types/college";

const DEBOUNCE_MS = 200;

/**
 * Top 5 colleges for a search term. Debounced, and every new term aborts the
 * previous request so a slow early response can never overwrite a newer one.
 */
export function useSuggestions(term: string) {
  const [results, setResults] = useState<CollegeCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = term.trim();

  useEffect(() => {
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await apiFetch<CollegeCardData[]>(`/api/colleges?q=${encodeURIComponent(trimmed)}&limit=5`, {
          signal: controller.signal,
        });
        setResults(data);
        setError(null);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setResults([]);
        setError(caught instanceof Error ? caught.message : "Search is unavailable right now.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  return { results, loading, error, active: trimmed.length >= 2 };
}
