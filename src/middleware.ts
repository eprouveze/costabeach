import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

// Cookie name for storing locale
const LOCALE_COOKIE = "NEXT_LOCALE";

// Middleware function 
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for non-page requests (including API routes and static files)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // Get the current locale (from cookie, or default to French)
  let locale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  // If the path is root, redirect to the locale home page
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // If the path doesn't have locale prefix, add it
  if (!pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }

  // For paths that already have a locale, proceed but set cookies and headers
  const response = NextResponse.next();

  // Extract the locale from the pathname
  const requestLocale = pathname.split('/')[1];
  if (locales.includes(requestLocale as any)) {
    // Set or update the locale cookie if needed
    response.cookies.set(LOCALE_COOKIE, requestLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Set HTML attributes via headers
    response.headers.set('x-html-lang', requestLocale);
    response.headers.set('x-html-dir', 
      requestLocale === 'ar' ? 'rtl' : 'ltr'
    );
  }

  return response;
}

// Only run on page requests, not API routes or static files
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}; 