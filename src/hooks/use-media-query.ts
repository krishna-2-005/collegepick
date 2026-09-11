"use client";

import { useSyncExternalStore } from "react";

/**
 * Live match for a CSS media query. The server snapshot is `false`, so content
 * gated on a wide screen isn't rendered (or hydrated) on phones at all; on
 * desktop it appears right after hydration.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
