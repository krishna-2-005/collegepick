"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { compareHref, useCompareStore } from "@/store/compare";
import { Container } from "./container";
import { Logo } from "./logo";

export function Navbar() {
  const pathname = usePathname();
  const compareItems = useCompareStore((state) => state.items);
  const compareCount = compareItems.length;
  // "Compare" opens the current selection, so the navbar is a way back to it.
  const links = [
    { path: "/colleges", href: "/colleges", label: "Colleges" },
    { path: "/compare", href: compareHref(compareItems), label: "Compare" },
    { path: "/predict", href: "/predict", label: "Predict" },
    { path: "/saved", href: "/saved", label: "Saved" },
  ];
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const onAuthPage = pathname === "/login" || pathname === "/signup";
  const loginHref = onAuthPage || pathname === "/" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] ?? "";

  const logOut = () => {
    setMenuOpen(false);
    void signOut({ redirectTo: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <Container className="flex h-16 items-center gap-8">
        <Logo />

        <nav aria-label="Main" className="hidden h-full items-stretch gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.href}
              aria-current={isActive(link.path) ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2 text-[0.9375rem] font-medium",
                isActive(link.path) ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {link.label}
              {link.path === "/compare" && compareCount > 0 ? <CompareCount count={compareCount} /> : null}
              {isActive(link.path) ? (
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {status === "loading" || (onAuthPage && !user) ? (
              <span aria-hidden className="h-9 w-20" />
            ) : user ? (
              <>
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Avatar name={user.name ?? "You"} size="sm" />
                  {firstName}
                </span>
                <Button variant="ghost" size="sm" onClick={logOut}>
                  Log out
                </Button>
              </>
            ) : (
              <ButtonLink href={loginHref} variant="secondary" size="sm">
                Log in
              </ButtonLink>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="relative flex size-10 items-center justify-center rounded-control text-ink hover:bg-line/60 md:hidden"
          >
            <Menu aria-hidden className="size-5" />
            {compareCount > 0 ? (
              <span aria-hidden className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" />
            ) : null}
          </button>
        </div>
      </Container>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title="Menu">
        <nav aria-label="Main" className="flex flex-col">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(link.path) ? "page" : undefined}
              className={cn(
                "flex h-12 items-center justify-between border-b border-line text-base font-medium last:border-b-0",
                isActive(link.path) ? "text-accent" : "text-ink",
              )}
            >
              {link.label}
              {link.path === "/compare" && compareCount > 0 ? <CompareCount count={compareCount} /> : null}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <Avatar name={user.name ?? "You"} size="sm" />
              <span className="truncate">{user.email}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={logOut}>
              Log out
            </Button>
          </div>
        ) : (
          <ButtonLink href={loginHref} onClick={() => setMenuOpen(false)} className="mt-4 w-full">
            Log in
          </ButtonLink>
        )}
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
