import { Check } from "lucide-react";
import type { ReactNode } from "react";

const valueLines = [
  "Filter 200 colleges by fees, exams and placements",
  "Compare up to three colleges side by side",
  "Save colleges and comparisons to come back to",
];

/** Split layout for login and signup: navy value panel (40%) and the form. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] md:grid-cols-[2fr_3fr]">
      <aside className="hidden flex-col justify-center gap-8 bg-ink px-10 py-16 text-white md:flex lg:px-16">
        <p className="max-w-[18ch] font-display text-3xl font-bold">
          Find the college that fits you, not just the one that ranks.
        </p>
        <ul className="flex flex-col gap-4">
          {valueLines.map((line) => (
            <li key={line} className="flex items-start gap-3 text-[0.9375rem] text-white/85">
              <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-white" />
              {line}
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex items-start justify-center px-4 py-12 md:items-center md:px-10">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl">{title}</h1>
            <p className="text-ink-muted">{subtitle}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
