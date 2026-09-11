"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSuggestions } from "@/hooks/use-suggestions";
import { cn } from "@/lib/utils";
import type { CollegeCardData } from "@/types/college";

type CollegeSearchProps = {
  /** Called when a college is picked. Without it, picking opens the college page. */
  onSelect?: (college: CollegeCardData) => void;
  /** Hide suggestions with these slugs (e.g. already in the comparison). */
  exclude?: string[];
  /** Show the Search button and send Enter to /colleges?q= when nothing is highlighted. */
  submitToListing?: boolean;
  size?: "md" | "lg";
  autoFocus?: boolean;
  placeholder?: string;
  label?: string;
};

/** WAI-ARIA combobox: arrow keys move through suggestions, Enter picks, Escape closes. */
export function CollegeSearch({
  onSelect,
  exclude = [],
  submitToListing = false,
  size = "md",
  autoFocus = false,
  placeholder = "Search colleges, cities, courses",
  label = "Search colleges",
}: CollegeSearchProps) {
  const router = useRouter();
  const id = useId();
  const listboxId = `${id}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { results, loading, error, active } = useSuggestions(term);

  const options = results.filter((college) => !exclude.includes(college.slug));
  const showList = open && active;

  function pick(college: CollegeCardData) {
    setOpen(false);
    setActiveIndex(-1);
    if (onSelect) {
      onSelect(college);
      setTerm("");
    } else {
      router.push(`/colleges/${college.slug}`);
    }
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const highlighted = options[activeIndex];
    if (highlighted) return pick(highlighted);
    if (submitToListing) {
      const q = term.trim();
      setOpen(false);
      router.push(q ? `/colleges?q=${encodeURIComponent(q)}` : "/colleges");
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (options.length === 0 ? -1 : (index + 1) % options.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (options.length === 0 ? -1 : index <= 0 ? options.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        // Keep a surrounding dialog open: the first Escape only closes the list.
        event.stopPropagation();
        setOpen(false);
        setActiveIndex(-1);
      }
    } else if (event.key === "Enter" && !submitToListing) {
      event.preventDefault();
      submit();
    }
  }

  const statusText = !active
    ? ""
    : loading
      ? "Searching…"
      : error
        ? error
        : options.length === 0
          ? `No colleges match “${term.trim()}”.`
          : `${options.length} ${options.length === 1 ? "college" : "colleges"} found.`;

  return (
    <form role="search" onSubmit={submit} className="relative flex w-full gap-2">
      <div className="relative flex-1">
        <label htmlFor={`${id}-input`} className="sr-only">
          {label}
        </label>
        <Search
          aria-hidden
          className={cn("pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted", size === "lg" ? "size-5" : "size-4.5")}
        />
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          role="combobox"
          autoComplete="off"
          autoFocus={autoFocus}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={showList && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          placeholder={placeholder}
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full rounded-control border border-line bg-surface text-ink placeholder:text-ink-muted/70 hover:border-ink-muted focus:border-accent",
            size === "lg" ? "h-13 pr-4 pl-11 text-lg" : "h-11 pr-3 pl-10 text-base",
          )}
        />
        <p className="sr-only" role="status" aria-live="polite">
          {statusText}
        </p>
        {showList ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Suggested colleges"
            className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-card border border-line bg-surface py-1"
          >
            {options.map((college, index) => (
              <li
                key={college.id}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // mousedown keeps focus in the input so blur doesn't close the list first
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(college)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer flex-col px-4 py-2.5",
                  index === activeIndex ? "bg-accent-soft" : "bg-surface",
                )}
              >
                <span className="text-[0.9375rem] font-medium text-ink">{college.name}</span>
                <span className="text-sm text-ink-muted">
                  {college.city}, {college.state}
                </span>
              </li>
            ))}
            {options.length === 0 ? (
              <li role="presentation" className="px-4 py-3 text-sm text-ink-muted">
                {statusText}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
      {submitToListing ? (
        <Button type="submit" className={size === "lg" ? "h-13 px-6 text-base" : undefined}>
          Search
        </Button>
      ) : null}
    </form>
  );
}
