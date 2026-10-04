import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../src/app/api/analyze/route";
import { NextRequest } from "next/server";
import * as geminiModule from "../src/lib/gemini";
import { _clearCache } from "../src/lib/cache";
import { _resetRateLimitStore } from "../src/lib/rateLimit";

describe("POST /api/analyze API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _clearCache();
    _resetRateLimitStore();
  });

  const validPayload = {
    decision: "Should I accept the startup offer?",
    options: ["Accept", "Decline"],
    keyDetails: "Series B startup offering $4500/mo.",
    leaning: "Leaning towards accepting for money.",
    tone: "Alfred",
  };

  const mockAnalysis = {
    observation: "A notable tension between cash flow and graduation pace.",
    decision_summary: "Evaluating job offer vs completion.",
    stated_reasons: ["High pay"],
    assumptions: [{ assumption: "Fast growth", why_it_matters: "Risk of burnout", how_to_test: "Ask peers" }],
    overlooked_factors: [{ category: "Academic", factor: "Graduation delay", why_it_matters: "Delayed job cycle", severity: "high" as const }],
    internal_conflicts: [{ statement_a: "A", statement_b: "B", tension: "C" }],
    bias_flags: [{ bias: "Present bias", evidence_quote: "Leaning towards money", note: "Near term emphasis" }],
    questions: [{ question: "Is part-time an option?", probes: ["Ask HR"] }],
    missing_information: ["Full time conversion rate"],
    safety_flag: false,
  };

  it("returns 200 with structured analysis on valid payload", async () => {
    vi.spyOn(geminiModule, "analyzeDecision").mockResolvedValueOnce(mockAnalysis);

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "123.45.67.89" },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.data.decision_summary).toBe("Evaluating job offer vs completion.");
    expect(data.cached).toBe(false);
  });

  it("returns cached: true on duplicate input", async () => {
    vi.spyOn(geminiModule, "analyzeDecision").mockResolvedValueOnce(mockAnalysis);

    const req1 = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "123.45.67.90" },
      body: JSON.stringify(validPayload),
    });
    await POST(req1);

    const req2 = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "123.45.67.90" },
      body: JSON.stringify(validPayload),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);

    const data2 = await res2.json();
    expect(data2.cached).toBe(true);
    // analyzeDecision should only have been called once
    expect(geminiModule.analyzeDecision).toHaveBeenCalledTimes(1);
  });

  it("returns 400 on malformed or too short input", async () => {
    const invalidPayload = {
      decision: "No", // too short
      keyDetails: "abc", // too short
      leaning: "x",
    };

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "123.45.67.91" },
      body: JSON.stringify(invalidPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 500 generic error on upstream failure without leaking secrets or stack traces", async () => {
    vi.spyOn(geminiModule, "analyzeDecision").mockRejectedValueOnce(new Error("Internal provider connection reset with key AIzaSyDUMMY"));

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "123.45.67.92" },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("An error occurred while examining your decision. Please try again in a few moments.");
    expect(JSON.stringify(data)).not.toContain("AIzaSy");
  });
});
