import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Jangan ganggu API
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Hanya proteksi halaman admin
  if (pathname.startsWith("/admin")) {
    // Halaman login boleh dibuka
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const adminCookie =
      request.cookies.get("magnificent_admin");

    if (!adminCookie?.value) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};