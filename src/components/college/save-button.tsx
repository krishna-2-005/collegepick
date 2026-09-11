"use client";

import { m, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { useLoginRedirect, useSavedColleges, useToggleSave } from "@/hooks/use-saved";
import { cn } from "@/lib/utils";
import type { CollegeCardData } from "@/types/college";

type SaveButtonProps = {
  college: CollegeCardData;
  /** "icon" sits on a card image; "button" is the labelled action on the detail page. */
  variant?: "icon" | "button";
  className?: string;
};

/**
 * Motion #3 of 3: the heart fills with a spring when tapped. It only animates
 * in response to a tap (not on load) and not at all under reduced motion.
 */
export function SaveButton({ college, variant = "icon", className }: SaveButtonProps) {
  const { status } = useSession();
  const { data: saved } = useSavedColleges();
  const toggle = useToggleSave();
  const redirectToLogin = useLoginRedirect();
  const reduceMotion = useReducedMotion();
  const [tapped, setTapped] = useState(false);

  const isSaved = Boolean(saved?.some((item) => item.id === college.id));

  function onClick(event: React.MouseEvent) {
    // Cards are links; the button must not navigate.
    event.preventDefault();
    event.stopPropagation();
    if (status !== "authenticated") {
      redirectToLogin("Log in to save colleges.");
      return;
    }
    setTapped(true);
    toggle.mutate({ college, save: !isSaved });
  }

  const heart = (
    <m.span
      key={isSaved ? "saved" : "unsaved"}
      className="inline-flex"
      initial={tapped && isSaved && !reduceMotion ? { scale: 0.55 } : false}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 14 }}
    >
      <Heart
        aria-hidden
        className={cn("size-5", isSaved ? "fill-accent text-accent" : "text-ink")}
        strokeWidth={isSaved ? 2 : 1.75}
      />
    </m.span>
  );

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSaved}
        className={buttonClasses({ variant: "secondary", className })}
      >
        {heart}
        {isSaved ? "Saved" : "Save college"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${college.name} from saved` : `Save ${college.name}`}
      className={cn(
        "flex size-10 items-center justify-center rounded-full border border-line bg-surface hover:border-ink-muted",
        className,
      )}
    >
      {heart}
    </button>
  );
}
