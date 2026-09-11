import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  /** Say what to do next, e.g. "Clear filters or widen the fee range." */
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-card border border-line bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent [&>svg]:size-5">
          {icon}
        </span>
      ) : null}
      <div className="flex max-w-[44ch] flex-col gap-1">
        <h3 className="text-lg">{title}</h3>
        <p className="text-[0.9375rem] text-ink-muted">{description}</p>
      </div>
      {action ? <div className="flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
