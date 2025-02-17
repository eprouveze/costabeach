import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicPaths = [
  '/',
  '/contact',
  '/property-detail(.*)',
  '/owner-login',
  '/owner-signup',
];

const isPublic = (path: string) => {
  return publicPaths.some(pattern => new RegExp(`^${pattern}$`).test(path));
};

export default withAuth(
  function middleware(req) {
    if (isPublic(req.nextUrl.pathname)) {
      return NextResponse.next();
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (isPublic(req.nextUrl.pathname)) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: '/owner-login',
    },
  }
);

export const config = {
  matcher: [
    // Skip Next.js internal paths and static files
    '/((?!.*\\..*|_next).*)',
    // Always run for API routes (or tRPC endpoints)
    '/(api|trpc)(.*)',
  ],
}; 