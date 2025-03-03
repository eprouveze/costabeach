import { NextResponse } from 'next/server';
import { appRouter } from "@/lib/api/root";
import { createTRPCContext } from "@/lib/api/trpc";

export async function GET() {
  try {
    // Create a context for the tRPC router
    const context = await createTRPCContext({ headers: new Headers() });
    
    // Call the health check procedure directly
    const caller = appRouter.createCaller(context);
    const healthCheck = await caller.documents.healthCheck();
    
    // Return the result
    return NextResponse.json({
      status: 'success',
      message: 'tRPC test successful',
      data: healthCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('tRPC test error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 