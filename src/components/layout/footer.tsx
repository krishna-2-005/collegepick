import Link from "next/link";
import { Container } from "./container";
import { Logo } from "./logo";

const links = [
  { href: "/colleges", label: "Colleges" },
  { href: "/compare", label: "Compare" },
  { href: "/predict", label: "Predict" },
  { href: "/saved", label: "Saved" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-[40ch] flex-col gap-2">
          <Logo className="text-lg" />
          <p className="text-sm text-ink-muted">
            Find the college that fits you, not just the one that ranks.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center text-sm text-ink-muted hover:text-ink md:min-h-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <div className="border-t border-line">
        <Container className="py-5">
          <p className="text-xs text-ink-muted">
            College data on this site is sample data for demonstration. Check fees and cutoffs with
            each college before applying.
          </p>
        </Container>
      </div>
    </footer>
  );
}
