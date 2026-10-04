import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../src/app/api/followup/route";
import { NextRequest } from "next/server";
import * as geminiModule from "../src/lib/gemini";
import { _resetRateLimitStore } from "../src/lib/rateLimit";

describe("POST /api/followup API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetRateLimitStore();
  });

  const validPayload = {
    decision: "Should I accept the startup offer?",
    previousObservation: "Previous tensions noted between graduation and offer.",
    answers: [
      {
        question: "Is part-time an option?",
        answer: "Yes, I spoke with the manager and 20 hrs/week is acceptable.",
      },
    ],
    tone: "Alfred",
  };

  const mockReflection = {
    reflection_summary: "Your answers indicate that part-time work provides flexibility.",
    what_shifted: ["Course completion risk is mitigated by half-time schedule."],
    new_blind_spots: [
      {
        category: "Workload",
        factor: "Managing both finals and sprint deliveries simultaneously",
        why_it_matters: "Risk of cognitive exhaustion",
        severity: "medium" as const,
      },
    ],
    remaining_questions: [
      {
        question: "How will you protect study hours during peak sprint cycles?",
        probes: ["Will you establish explicit blackout periods for exams?"],
      },
    ],
    safety_flag: false,
  };

  it("returns 200 with structured reflection on valid input", async () => {
    vi.spyOn(geminiModule, "followupReflection").mockResolvedValueOnce(mockReflection);

    const req = new NextRequest("http://localhost:3000/api/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.50" },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.what_shifted).toHaveLength(1);
    expect(json.data.new_blind_spots[0].factor).toBe("Managing both finals and sprint deliveries simultaneously");
  });

  it("returns 400 when answers array is empty or missing", async () => {
    const invalidPayload = {
      decision: "Should I accept the startup offer?",
      answers: [],
    };

    const req = new NextRequest("http://localhost:3000/api/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.51" },
      body: JSON.stringify(invalidPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 500 without leaking secrets on upstream provider error", async () => {
    vi.spyOn(geminiModule, "followupReflection").mockRejectedValueOnce(
      new Error("Secret leak attempt with key AIzaSyDUMMY_SECRET_KEY")
    );

    const req = new NextRequest("http://localhost:3000/api/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.52" },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBe("An error occurred while analyzing your reflection. Please try again.");
    expect(JSON.stringify(json)).not.toContain("AIzaSyDUMMY_SECRET_KEY");
  });
});
