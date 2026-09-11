import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** 1200px content width with 24px gutters (16px on mobile). */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1248px] px-4 md:px-6", className)} {...props} />;
}
