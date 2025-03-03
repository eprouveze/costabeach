import { createCallerFactory } from "@/lib/api/trpc";
import { appRouter } from "@/lib/api/root";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get the session
    const session = await getServerAuthSession();
    
    // Create a tRPC caller with the required context
    const createCaller = createCallerFactory(appRouter);
    const caller = createCaller({
      session,
      headers: new Headers(),
      db: prisma,
    });
    
    // Call the healthCheck procedure that exists in the router
    const result = await caller.healthCheck();
    
    return Response.json({
      status: 'ok',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('tRPC test error:', error);
    return Response.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV !== 'production' 
        ? error instanceof Error ? error.stack : undefined
        : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}