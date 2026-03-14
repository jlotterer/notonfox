import { NextRequest, NextResponse } from "next/server";
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/analysisCache";

/**
 * GET /api/analysis-cache
 * Returns today's cached analysis if available.
 */
export async function GET() {
  const cached = await getCachedAnalysis();
  if (cached) {
    return NextResponse.json(cached);
  }
  return NextResponse.json(null, { status: 404 });
}

/**
 * POST /api/analysis-cache
 * Stores the completed analysis for today.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  await setCachedAnalysis(body);
  return NextResponse.json({ ok: true });
}
