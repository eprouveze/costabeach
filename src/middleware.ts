import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

// Cookie name for storing locale
const LOCALE_COOKIE = "NEXT_LOCALE";

// Middleware function to handle locale detection
export default function middleware(request: NextRequest) {
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
  
  // Clone the response
  const response = NextResponse.next();
  
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

// Only run middleware on non-auth routes
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|owner-dashboard|api/trpc).*)",
  ],
}; 