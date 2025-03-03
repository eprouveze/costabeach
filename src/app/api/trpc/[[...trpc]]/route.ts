import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { appRouter } from "@/lib/api/root";
import { createTRPCContext } from "@/lib/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  try {
    // Log the request URL and path for debugging
    console.log(`tRPC request: ${req.url}, path: ${req.nextUrl.pathname}`);
    
    return createTRPCContext({
      headers: req.headers,
    });
  } catch (error) {
    console.error("Error creating tRPC context:", error);
    throw error;
  }
};

const env = process.env;

const handler = (req: NextRequest) => {
  // Debug information for the request
  console.log(`Processing tRPC request to: ${req.nextUrl.pathname}`);
  console.log(`Request method: ${req.method}`);
  
  try {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: () => createContext(req),
      onError:
        env.NODE_ENV === "development"
          ? ({ path, error }) => {
              console.error(
                `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
                error.stack ? `\nStack: ${error.stack}` : "",
                error.cause ? `\nCause: ${error.cause}` : ""
              );
            }
          : ({ path, error }) => {
              console.error(`tRPC failed on ${path ?? "<no-path>"}`, error);
            },
    });
  } catch (error) {
    console.error("Error in tRPC handler:", error);
    throw error;
  }
};

export { handler as GET, handler as POST };
