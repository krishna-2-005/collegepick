import { cn } from "@/lib/utils";

/**
 * Static placeholder block. It does not pulse: the motion policy allows only
 * three animations, and loading states are not one of them.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("rounded-control bg-line/70", className)} />;
}
