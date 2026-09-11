"use client";

import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type" | "trailing">;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-pressed={visible}
          className="h-9 rounded-control px-3 text-sm font-medium text-ink-muted hover:bg-line/60 hover:text-ink"
        >
          {visible ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      }
    />
  );
}
