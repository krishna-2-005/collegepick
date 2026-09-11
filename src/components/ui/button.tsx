import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium select-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary: "border border-line bg-surface text-ink hover:border-ink-muted",
  ghost: "text-ink-muted hover:bg-line/60 hover:text-ink",
  danger: "bg-warn text-white hover:bg-warn-strong",
};

// sm is 40px on mobile to keep the hit target, 36px from md up.
const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-3 text-sm md:h-9",
  md: "h-11 px-4 text-[0.9375rem]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Disables the button and announces it as busy. */
  loading?: boolean;
  /** Label shown while loading, e.g. "Saving college…". */
  loadingText?: string;
  icon?: ReactNode;
};

export function Button({
  variant,
  size,
  loading = false,
  loadingText,
  icon,
  className,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {icon}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

export function ButtonLink({ variant, size, icon, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {icon}
      {children}
    </Link>
  );
}
