import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

// Cookie name for storing locale
const LOCALE_COOKIE = "NEXT_LOCALE";

// Debug helper to log redirect information
function logRedirect(from: string, to: string) {
  console.log(`[Middleware] Redirecting: ${from} → ${to}`);
  return;
}

// Middleware function to handle internationalization
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /en, /fr/about)
  const { pathname, origin } = request.nextUrl;

  // Log middleware execution
  console.log(`[Middleware] Processing path: ${pathname}`);

  // Skip for non-page requests (API routes, static files, etc.)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Get the locale from cookie or default to French
  let locale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // CASE 1: Root path - redirect to the locale home page
  if (pathname === '/' || pathname === '') {
    const redirectUrl = `${origin}/${locale}`;
    logRedirect(pathname, redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // CASE 2: Missing locale prefix - add the locale
  if (!pathnameHasLocale) {
    const redirectUrl = `${origin}/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
    logRedirect(pathname, redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // CASE 3: Path already has a locale - just proceed
  const response = NextResponse.next();

  // Extract the locale from the pathname
  const pathLocale = pathname.split('/')[1];
  if (locales.includes(pathLocale as any)) {
    // Set the locale cookie if path has a valid locale
    response.cookies.set(LOCALE_COOKIE, pathLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Set HTML attributes via headers for RTL/LTR support
    response.headers.set('x-html-lang', pathLocale);
    response.headers.set(
      'x-html-dir', 
      pathLocale === 'ar' ? 'rtl' : 'ltr'
    );
  }

  return response;
}

// Configure matcher to explicitly include the root path and non-asset paths
export const config = {
  matcher: [
    // Match the root path exactly
    '/',
    // Match all paths that don't start with excluded patterns
    '/((?!_next/|api/|static/|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}; 