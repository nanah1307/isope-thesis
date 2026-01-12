import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) as any;

  // Not logged in
  if (!token && req.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // // Block /admin for non-osas users
  // if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "osas") {
  //   return NextResponse.redirect(new URL("/no-access", req.url));
  // }

  // Logged in users shouldn't see login page
  if (token && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|img|api/auth|ui).*)"],
};
// ...existing code...