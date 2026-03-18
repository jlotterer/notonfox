import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the auth endpoint (login/logout)
  if (pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  // Protect all other /api/admin/* routes
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
