import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    url: url.toString(),
    message: 'Health check successful'
  });
} 