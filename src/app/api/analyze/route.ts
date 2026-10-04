import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/schema";
import { checkRateLimit } from "@/lib/rateLimit";
import { generateCacheKey, getCachedAnalysis, setCachedAnalysis } from "@/lib/cache";
import { analyzeDecision } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * POST /api/analyze
 * Generates structured blind-spot analysis for a user's decision context.
 */
export async function POST(req: NextRequest) {
  // 1. Per-IP Rate Limiting
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait a moment before submitting another decision.",
        resetSeconds: rateLimit.resetSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetSeconds),
        },
      }
    );
  }

  // 2. Body parsing and Zod Validation
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request payload." }, { status: 400 });
  }

  const parseResult = AnalyzeRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues.map((issue) => issue.message).join(" ");
    return NextResponse.json({ error: errorDetails || "Invalid decision input." }, { status: 400 });
  }

  const validatedInput = parseResult.data;

  // 3. Cache Check (Efficiency)
  const cacheKey = generateCacheKey(validatedInput);
  const cachedResult = getCachedAnalysis(cacheKey);
  if (cachedResult) {
    return NextResponse.json(
      {
        data: cachedResult,
        cached: true,
      },
      { status: 200 }
    );
  }

  // 4. Gemini Structured Analysis Call with Guardrail Check
  try {
    const analysis = await analyzeDecision(validatedInput);
    // Cache successful analysis
    setCachedAnalysis(cacheKey, analysis);

    return NextResponse.json(
      {
        data: analysis,
        cached: false,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    // SECURITY: Never leak API keys, system headers, or raw provider stack traces to the client
    const errorMessage =
      err instanceof Error && err.message.includes("timed out")
        ? "The thinking engine timed out. Please try again."
        : "An error occurred while examining your decision. Please try again in a few moments.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
