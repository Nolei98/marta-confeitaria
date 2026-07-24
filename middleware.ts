import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const role = req.auth?.user?.role;
  const path = req.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin") || path.startsWith("/api/admin");
  const allowed = isAdminRoute ? role === "ADMIN" : role === "PARTNER" || role === "ADMIN";

  if (!allowed) {
    const loginUrl = new URL("/conta", req.nextUrl);
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/parceiro/:path*"],
};
