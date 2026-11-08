import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/server/auth.config";

const { auth } = NextAuth(authConfig);

/** Protects /admin/* (except the login page) and /preview. Server actions re-check the session too. */
export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.auth) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/preview"],
};
