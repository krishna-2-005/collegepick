"use client";

import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { Toaster as Sonner } from "sonner";

export { toast } from "sonner";

/**
 * App-wide toaster. Top-center so it never collides with the sticky compare
 * bar at the bottom. No shadow (reserved for the compare bar and dialogs).
 */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      offset={80}
      mobileOffset={72}
      visibleToasts={3}
      icons={{
        success: <CircleCheck className="size-5 text-good" aria-hidden />,
        error: <CircleAlert className="size-5 text-warn" aria-hidden />,
        info: <Info className="size-5 text-accent" aria-hidden />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-3 rounded-card border border-line bg-surface px-4 py-3 text-ink",
          title: "text-[0.9375rem] font-medium",
          description: "text-sm text-ink-muted",
          icon: "mt-0.5",
          actionButton:
            "ml-auto h-9 shrink-0 rounded-control px-3 text-sm font-medium text-accent hover:bg-accent-soft",
        },
      }}
    />
  );
}
