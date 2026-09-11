"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const DETAIL_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses" },
  { id: "placements", label: "Placements" },
  { id: "reviews", label: "Reviews" },
] as const;

/**
 * Sticky in-page navigation. Links jump to sections (no smooth-scroll animation);
 * an IntersectionObserver marks the section currently under the bar.
 */
export function SectionNav() {
  const [active, setActive] = useState<string>(DETAIL_SECTIONS[0].id);

  useEffect(() => {
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const first = DETAIL_SECTIONS.find((section) => visible.get(section.id));
        if (first) setActive(first.id);
      },
      // A band just below the sticky navbar and this bar.
      { rootMargin: "-120px 0px -55% 0px" },
    );
    for (const section of DETAIL_SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="sticky top-16 z-30 -mx-4 border-b border-line bg-bg px-4 md:-mx-6 md:px-6"
    >
      <ul className="flex gap-6 overflow-x-auto">
        {DETAIL_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={() => setActive(section.id)}
              aria-current={active === section.id ? "location" : undefined}
              className={cn(
                "-mb-px flex h-12 items-center border-b-2 text-[0.9375rem] font-medium whitespace-nowrap",
                active === section.id ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
