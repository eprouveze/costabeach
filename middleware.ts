import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/contact",
    "/property-detail(.*)",
    "/owner-login",
    "/owner-signup",
  ],
  // Routes that can be accessed by authenticated users only
  ignoredRoutes: [
    "/(api|trpc)(.*)",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 