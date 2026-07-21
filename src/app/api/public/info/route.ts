import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Compass - AI-Powered Care Coordination",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
