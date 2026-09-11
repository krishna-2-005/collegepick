"use client";

import { useEffect, useState } from "react";
import { useCompareStore } from "@/store/compare";

/** True once the compare selection has been restored from sessionStorage. */
export function useCompareHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useCompareStore.persist.hasHydrated()) setHydrated(true);
    return useCompareStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}
