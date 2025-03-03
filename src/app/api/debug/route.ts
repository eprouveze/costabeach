import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get information about the request
  const url = new URL(request.url);
  const headers = Object.fromEntries(request.headers);
  
  // Return diagnostic information
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    request: {
      url: request.url,
      method: request.method,
      pathname: url.pathname,
      searchParams: Object.fromEntries(url.searchParams),
    },
    headers,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
    },
    message: "This endpoint is working correctly. If you can see this JSON response, the API routing is functional."
  });
} 