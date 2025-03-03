import { NextResponse } from "next/server";

export async function GET() {
  // Get the health status of various subsystems
  const status = {
    api: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0"
  };

  return NextResponse.json(status);
} 