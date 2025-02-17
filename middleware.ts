import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

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

export function middleware(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const { userId } = getAuth(request);

  if (!userId) {
    const signInUrl = new URL('/owner-login', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internal paths and static files
    '/((?!.*\..*|_next).*)',
    // Always run for API routes (or tRPC endpoints)
    '/(api|trpc)(.*)',
  ],
}; 