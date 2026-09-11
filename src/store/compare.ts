import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_COMPARE } from "@/lib/constants";
import type { CollegeCardData } from "@/types/college";

export type CompareItem = Pick<CollegeCardData, "id" | "slug" | "name" | "shortName" | "imageUrl">;

type CompareState = {
  items: CompareItem[];
  /** "full" when the selection already holds MAX_COMPARE colleges. */
  toggle: (item: CompareItem) => "added" | "removed" | "full";
  remove: (slug: string) => void;
  clear: () => void;
  /** Mirror the /compare URL into the store. */
  replace: (items: CompareItem[]) => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const { items } = get();
        if (items.some((existing) => existing.slug === item.slug)) {
          set({ items: items.filter((existing) => existing.slug !== item.slug) });
          return "removed";
        }
        if (items.length >= MAX_COMPARE) return "full";
        set({ items: [...items, toCompareItem(item)] });
        return "added";
      },
      remove: (slug) => set({ items: get().items.filter((item) => item.slug !== slug) }),
      clear: () => set({ items: [] }),
      replace: (items) => set({ items: items.slice(0, MAX_COMPARE).map(toCompareItem) }),
    }),
    {
      name: "collegepick-compare",
      // Survives refresh, cleared when the tab closes.
      storage: createJSONStorage(() => sessionStorage),
      // Rehydrated after mount (see Providers) so server and first client render match.
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

function toCompareItem({ id, slug, name, shortName, imageUrl }: CompareItem): CompareItem {
  return { id, slug, name, shortName, imageUrl };
}

export function compareHref(items: Pick<CompareItem, "slug">[]): string {
  return items.length > 0 ? `/compare?ids=${items.map((item) => item.slug).join(",")}` : "/compare";
}
