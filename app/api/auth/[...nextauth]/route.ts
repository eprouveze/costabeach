import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/index";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Explicitly tell Next.js that this route must run in a Node.js
// serverless function (not the default edge runtime). The edge
// runtime cannot bundle the `next-auth` package and will otherwise
// deploy a tiny stub that returns 404 in production.
export const runtime = "nodejs";

// NextAuth needs to evaluate the request on every invocation because it
// inspects cookies and headers – make sure the route is always dynamic.
export const dynamic = "force-dynamic"; 