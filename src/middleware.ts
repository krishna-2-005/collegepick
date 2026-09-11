import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { safeNext } from "@/lib/safe-redirect";

const { auth } = NextAuth(authConfig);

const PROTECTED = ["/saved"];
const AUTH_PAGES = ["/login", "/signup"];

export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  const signedIn = Boolean(request.auth?.user);

  if (!signedIn && PROTECTED.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    const url = new URL("/login", request.nextUrl);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (signedIn && AUTH_PAGES.includes(pathname)) {
    const next = safeNext(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next, request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Node runtime: Auth.js's JWT code uses APIs the Edge checker flags.
  runtime: "nodejs",
  matcher: ["/saved/:path*", "/login", "/signup"],
};
