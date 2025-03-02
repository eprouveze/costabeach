import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

// Cookie name for storing locale
const LOCALE_COOKIE = "NEXT_LOCALE";

// Public paths that don't require authentication
const publicPaths = [
  "/", 
  "/owner-login", 
  "/owner-register",
  "/fr",
  "/en",
  "/ar",
  "/fr/owner-login",
  "/fr/owner-register",
  "/en/owner-login",
  "/en/owner-register",
  "/ar/owner-login",
  "/ar/owner-register"
];

// Middleware function to handle locale detection
function handleLocale(request: NextRequest, response: NextResponse) {
  // Get locale from cookie or Accept-Language header
  let locale = request.cookies.get(LOCALE_COOKIE)?.value;
  
  // If no locale in cookie, try to get from Accept-Language header
  if (!locale) {
    const acceptLanguage = request.headers.get("Accept-Language");
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(",")
        .map((lang) => lang.split(";")[0].trim())
        .find((lang) => locales.includes(lang as any));
      
      if (preferredLocale) {
        locale = preferredLocale;
      }
    }
  }
  
  // If still no locale, use default
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }
  
  // Set cookie if it doesn't exist or is different
  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  
  // Set HTML dir attribute for RTL languages (Arabic)
  if (locale === "ar") {
    response.headers.set("x-html-dir", "rtl");
  } else {
    response.headers.set("x-html-dir", "ltr");
  }
  
  return response;
}

// Custom middleware function
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  
  // Redirect root path to include the default locale
  if (pathname === '/') {
    const url = new URL(`/${defaultLocale}`, req.url);
    return NextResponse.redirect(url);
  }
  
  // Redirect paths without locale prefix to include the locale
  if (!pathnameHasLocale && 
      !pathname.startsWith("/_next") && 
      !pathname.startsWith("/api") && 
      !pathname.startsWith("/static") && 
      pathname !== "/favicon.ico") {
    // Get locale from cookie or default
    const locale = req.cookies.get(LOCALE_COOKIE)?.value || defaultLocale;
    const url = new URL(`/${locale}${pathname}`, req.url);
    return NextResponse.redirect(url);
  }
  
  // Create the initial response
  let response = NextResponse.next();
  
  // Apply locale handling to all routes
  response = handleLocale(req, response);

  // Allow public paths without authentication checks
  if (publicPaths.includes(pathname) || 
      pathname.startsWith("/_next") || 
      pathname.startsWith("/api") || 
      pathname.startsWith("/static") || 
      pathname === "/favicon.ico") {
    return response;
  }

  // For protected routes, check authentication
  const authCookie = req.cookies.get("next-auth.session-token");
  const isAuthenticated = !!authCookie;

  // If the user is trying to access a protected route but is not authenticated,
  // redirect them to the login page with the correct locale
  if (pathname.includes("/owner-dashboard") && !isAuthenticated) {
    // Extract locale from the current path
    const pathLocale = pathname.split("/")[1];
    const locale = locales.includes(pathLocale as any) ? pathLocale : defaultLocale;
    const redirectUrl = new URL(`/${locale}/owner-login`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Otherwise, allow the request to proceed with the locale settings
  return response;
}

// Only run middleware on pages, not on API routes or static files
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}; 