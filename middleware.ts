import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/contact",
  "/owner-login",
  "/owner-register",
  "/auth/verify",
  "/auth/error",
  "/auth/signin",
  "/auth/signout",
  "/privacy",
];

// Admin paths that require admin access
const adminPaths = ["/admin"];

// Custom middleware function without withAuth
export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public paths without any checks
  if (publicPaths.some(path => pathname === path || pathname.startsWith("/auth/"))) {
    return NextResponse.next();
  }

  // For admin paths and protected routes, use withAuth
  return withAuth(req, {
    callbacks: {
      authorized: ({ token }) => {
        // For admin paths, require admin token
        if (pathname.startsWith("/admin")) {
          return !!token?.isAdmin;
        }
        // For all other protected routes, just require a valid token
        return !!token;
      },
    },
    pages: {
      signIn: "/owner-login",
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}; 