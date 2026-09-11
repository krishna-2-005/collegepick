import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

const base =
  "inline-flex h-10 items-center gap-1.5 rounded-control border px-3 text-sm font-medium whitespace-nowrap md:h-8";

const idle = "border-line bg-surface text-ink hover:border-ink-muted";
const active = "border-accent bg-accent-soft text-accent";

type CommonProps = {
  children: ReactNode;
  /** Muted number after the label, e.g. colleges per state. */
  count?: number;
  className?: string;
};

type ToggleChipProps = CommonProps & {
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  disabled?: boolean;
};

/** Selectable filter chip. Announced as a toggle button. */
export function Chip({ selected, onSelectedChange, disabled, count, className, children }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelectedChange(!selected)}
      className={cn(base, selected ? active : idle, "disabled:opacity-50", className)}
    >
      {children}
      {count !== undefined ? <ChipCount count={count} selected={selected} /> : null}
    </button>
  );
}

type LinkChipProps = CommonProps & { href: string };

/** Chip that navigates, e.g. "Popular: JEE Main" or "Browse by state". */
export function LinkChip({ href, count, className, children }: LinkChipProps) {
  return (
    <Link href={href} className={cn(base, idle, className)}>
      {children}
      {count !== undefined ? <ChipCount count={count} /> : null}
    </Link>
  );
}

type RemovableChipProps = {
  children: string;
  onRemove: () => void;
  className?: string;
};

/** Active filter chip with a remove action, e.g. "Karnataka ×". */
export function RemovableChip({ children, onRemove, className }: RemovableChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter: ${children}`}
      className={cn(base, active, "pr-2 hover:border-accent-strong", className)}
    >
      {children}
      <X aria-hidden className="size-4" />
    </button>
  );
}

function ChipCount({ count, selected = false }: { count: number; selected?: boolean }) {
  return (
    <span className={cn("font-normal", selected ? "text-accent/80" : "text-ink-muted")}>
      {formatCount(count)}
    </span>
  );
}
