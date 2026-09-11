"use client";

import { Check, GitCompareArrows } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { MAX_COMPARE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCompareStore, type CompareItem } from "@/store/compare";

type CompareToggleProps = {
  college: CompareItem;
  variant?: "icon" | "button";
  className?: string;
};

export function CompareToggle({ college, variant = "icon", className }: CompareToggleProps) {
  const selected = useCompareStore((state) => state.items.some((item) => item.slug === college.slug));
  const toggle = useCompareStore((state) => state.toggle);

  function onClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (toggle(college) === "full") {
      toast.error(`You can compare up to ${MAX_COMPARE} colleges`, {
        description: "Remove one from the compare bar to add another.",
      });
    }
  }

  if (variant === "button") {
    return (
      <button type="button" onClick={onClick} aria-pressed={selected} className={buttonClasses({ variant: "secondary", className })}>
        {selected ? <Check aria-hidden className="size-5 text-accent" /> : <GitCompareArrows aria-hidden className="size-5" />}
        {selected ? "In compare" : "Add to compare"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${college.name} from compare` : `Add ${college.name} to compare`}
      className={cn(
        "flex size-10 items-center justify-center rounded-full border",
        selected ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink hover:border-ink-muted",
        className,
      )}
    >
      {selected ? <Check aria-hidden className="size-5" /> : <GitCompareArrows aria-hidden className="size-5" />}
    </button>
  );
}
