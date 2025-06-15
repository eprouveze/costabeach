import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/index";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Explicit Node.js runtime to ensure Vercel deploys a proper serverless function.
export const runtime = "nodejs";

// Force this route to be dynamic so that cookies and headers are evaluated on each request.
export const dynamic = "force-dynamic";
