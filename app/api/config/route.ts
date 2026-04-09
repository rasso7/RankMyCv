import { NextResponse } from "next/server";

export async function GET() {
  const hasServerKey = !!(process.env.GEMINI_API_KEY?.trim());
  return NextResponse.json({ hasServerKey });
}
