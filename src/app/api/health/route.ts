import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Cloud Run readiness and liveness health check endpoint.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "blind-spot",
      timestamp: new Date().toISOString(),
      models: {
        primary: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        fallback: process.env.GEMINI_MODEL_FALLBACK || "gemini-3.5-flash-lite",
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
