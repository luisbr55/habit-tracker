import NextAuth from "next-auth";

import authConfig from "./auth.config";

import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/auth");

  if (!req.auth && !isPublic) {
    const login = new URL("/login", req.nextUrl.origin);

    login.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(login);
  }

  if (
    req.auth &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    return NextResponse.redirect(
      new URL("/", req.nextUrl.origin)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};