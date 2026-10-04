import { NextRequest, NextResponse } from "next/server";
import { FollowupRequestSchema } from "@/lib/schema";
import { checkRateLimit } from "@/lib/rateLimit";
import { followupReflection } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * POST /api/followup
 * Produces structured reflection on how user answers have shifted blind spots.
 */
export async function POST(req: NextRequest) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait a moment before submitting your reflections.",
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request payload." }, { status: 400 });
  }

  const parseResult = FollowupRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues.map((i) => i.message).join(" ");
    return NextResponse.json({ error: errorDetails || "Invalid reflection answers." }, { status: 400 });
  }

  try {
    const reflection = await followupReflection(parseResult.data);
    return NextResponse.json({ data: reflection }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "An error occurred while analyzing your reflection. Please try again." },
      { status: 500 }
    );
  }
}
