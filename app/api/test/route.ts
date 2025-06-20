import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Test API route is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; 