"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion } from "framer-motion";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect, useState, type ReactNode } from "react";
import { ApiClientError } from "@/lib/api-client";
import { useCompareStore } from "@/store/compare";

const loadMotionFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Don't retry client errors (400/401/404); they won't fix themselves.
            retry: (count, error) => !(error instanceof ApiClientError && error.status >= 400 && error.status < 500) && count < 2,
          },
        },
      }),
  );

  useEffect(() => {
    void useCompareStore.persist.rehydrate();
  }, []);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          {/* Animation features load after first paint; the three motions all follow a user action. */}
          <LazyMotion features={loadMotionFeatures} strict>
            {children}
          </LazyMotion>
        </NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
}
