"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { Logo } from "./logo";

type NavbarProps = {
  /** Colleges currently in the compare selection. */
  compareCount?: number;
};

const links = [
  { href: "/colleges", label: "Colleges" },
  { href: "/compare", label: "Compare" },
  { href: "/saved", label: "Saved" },
] as const;

export function Navbar({ compareCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <Container className="flex h-16 items-center gap-8">
        <Logo />

        <nav aria-label="Main" className="hidden h-full items-stretch gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2 text-[0.9375rem] font-medium",
                isActive(link.href) ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {link.label}
              {link.href === "/compare" && compareCount > 0 ? (
                <CompareCount count={compareCount} />
              ) : null}
              {isActive(link.href) ? (
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <ButtonLink href="/login" variant="secondary" size="sm">
              Log in
            </ButtonLink>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex size-10 items-center justify-center rounded-control text-ink hover:bg-line/60 md:hidden"
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </Container>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title="Menu">
        <nav aria-label="Main" className="flex flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "flex h-12 items-center justify-between border-b border-line text-base font-medium last:border-b-0",
                isActive(link.href) ? "text-accent" : "text-ink",
              )}
            >
              {link.label}
              {link.href === "/compare" && compareCount > 0 ? (
                <CompareCount count={compareCount} />
              ) : null}
            </Link>
          ))}
        </nav>
        <ButtonLink href="/login" onClick={() => setMenuOpen(false)} className="mt-4 w-full">
          Log in
        </ButtonLink>
      </Drawer>
    </header>
  );
}

function CompareCount({ count }: { count: number }) {
  return (
    <Badge tone="solid" className="h-5 min-w-5 justify-center rounded-full px-1.5">
      <span className="sr-only">,</span>
      {count}
      <span className="sr-only">{count === 1 ? " college selected" : " colleges selected"}</span>
    </Badge>
  );
}
