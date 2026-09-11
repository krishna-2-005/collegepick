import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

/** Label + control + hint/error, shared by Input and Select. */
export function Field({ id, label, hideLabel, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-sm font-medium text-ink", hideLabel && "sr-only")}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-warn">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export const controlClasses =
  "h-11 w-full rounded-control border border-line bg-surface px-3 text-base text-ink placeholder:text-ink-muted/70 hover:border-ink-muted focus:border-accent disabled:cursor-not-allowed disabled:bg-bg disabled:opacity-60 aria-invalid:border-warn";
