"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { useCompareHydrated } from "@/hooks/use-compare-hydrated";
import { initials } from "@/lib/utils";
import { compareHref, useCompareStore } from "@/store/compare";

/**
 * Motion #1 of 3: the bar slides up when the first college is added and each
 * college's avatar pops in. Hidden on /compare itself. No motion under
 * prefers-reduced-motion. It is one of the two places allowed a shadow.
 */
export function CompareBar() {
  const pathname = usePathname();
  const items = useCompareStore((state) => state.items);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);
  const hydrated = useCompareHydrated();
  const reduceMotion = useReducedMotion();

  // Before hydration the selection is unknown; rendering nothing avoids a replayed slide-in.
  if (!hydrated) return null;
  const visible = items.length > 0 && pathname !== "/compare";
  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 34 };
  const pop = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 600, damping: 20 };

  return (
    <>
      {/* Keeps the footer reachable above the fixed bar. */}
      {visible ? <div aria-hidden className="h-24" /> : null}
      <AnimatePresence initial={false}>
        {visible ? (
          <m.aside
            key="compare-bar"
            aria-label="Compare selection"
            initial={{ y: "140%" }}
            animate={{ y: 0 }}
            exit={{ y: "140%" }}
            transition={spring}
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-4xl items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-float md:gap-4 md:p-4"
          >
            <ul className="flex min-w-0 flex-1 items-center gap-2">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <m.li
                    key={item.slug}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={pop}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-bg py-1 pr-1 pl-1 md:pr-1.5"
                  >
                    <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-xs font-semibold text-accent">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt="" fill sizes="32px" className="object-cover" />
                      ) : (
                        initials(item.name)
                      )}
                    </span>
                    <span className="hidden max-w-28 truncate text-sm font-medium md:block" title={item.name}>
                      {item.shortName ?? item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(item.slug)}
                      aria-label={`Remove ${item.name} from compare`}
                      className="hidden size-8 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-line/60 hover:text-ink md:flex"
                    >
                      <X aria-hidden className="size-4" />
                    </button>
                  </m.li>
                ))}
              </AnimatePresence>
            </ul>
            <Button variant="ghost" size="sm" onClick={clear} className="hidden sm:inline-flex">
              Clear
            </Button>
            {items.length >= 2 ? (
              <ButtonLink href={compareHref(items)} size="sm" className="shrink-0">
                Compare {items.length} colleges
              </ButtonLink>
            ) : (
              <Button size="sm" disabled className="shrink-0">
                Add 1 more
              </Button>
            )}
          </m.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
