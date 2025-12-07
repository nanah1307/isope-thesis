// middleware.ts
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";


export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Not logged in
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  // Block /admin for non-osas users
  if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/no-access", req.url));
  }
  
  if (req.nextUrl.pathname === "/login") {

    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes EXCEPT login and NextAuth API
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|img|login|api/auth).*)"],
};