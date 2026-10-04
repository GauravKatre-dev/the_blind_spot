import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeDecision, followupReflection } from "../src/lib/gemini";
import type { AnalyzeRequest } from "../src/lib/schema";

// Set a dummy test API key
process.env.GEMINI_API_KEY = "test-dummy-api-key-never-used";

const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
    },
  };
});

describe("Gemini Client & Guardrails with Mocked Upstream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validRequest: AnalyzeRequest = {
    decision: "Should I accept the startup internship?",
    options: ["Accept startup offer", "Finish university semester"],
    keyDetails: "Stipend is $4500/mo, 15 min from home, 50 hrs/wk.",
    leaning: "Leaning towards accepting for money and proximity.",
    tone: "Alfred",
  };

  const validGeminiResponse = {
    observation: "A compelling dilemma between immediate financial gain and cohort graduation timeline.",
    decision_summary: "Evaluating startup internship offer versus finishing college on schedule.",
    stated_reasons: ["High compensation", "Short commute"],
    assumptions: [
      {
        assumption: "Startup experience will outweigh traditional capstone completion.",
        why_it_matters: "Delayed graduation can push recruiting cycles back an entire year.",
        how_to_test: "Check university policy on summer capstones.",
      },
    ],
    overlooked_factors: [
      {
        category: "Academic",
        factor: "Capstone project prerequisite",
        why_it_matters: "Missing it delays graduation.",
        severity: "high" as const,
      },
    ],
    internal_conflicts: [
      {
        statement_a: "Wants steady academic completion",
        statement_b: "Willing to accept 50+ hours of startup commitments",
        tension: "Time collision between academic standards and startup overtime.",
      },
    ],
    bias_flags: [
      {
        bias: "Present Bias",
        evidence_quote: "Leaning towards accepting for money and proximity",
        note: "Immediate tangible rewards may be eclipsing future structural milestones.",
      },
    ],
    questions: [
      {
        question: "What specific trade-offs will your academic department accept for leave of absence?",
        probes: ["Is a part-time arrangement permissible?"],
      },
    ],
    missing_information: ["Whether company offers full-time return offer"],
    safety_flag: false,
  };

  it("successfully analyzes decision when Gemini returns conforming JSON", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(validGeminiResponse),
    });

    const result = await analyzeDecision(validRequest);
    expect(result.decision_summary).toBe("Evaluating startup internship offer versus finishing college on schedule.");
    expect(result.assumptions).toHaveLength(1);
    expect(result.overlooked_factors[0].severity).toBe("high");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("falls back to GEMINI_MODEL_FALLBACK when primary model fails with 404/not found", async () => {
    process.env.GEMINI_MODEL = "gemini-3.8-flash";
    process.env.GEMINI_MODEL_FALLBACK = "gemini-3.5-flash-lite";

    // Primary call fails with 404
    mockGenerateContent
      .mockRejectedValueOnce(new Error("models/gemini-3.8-flash is not found 404"))
      // Fallback succeeds
      .mockResolvedValueOnce({
        text: JSON.stringify(validGeminiResponse),
      });

    const result = await analyzeDecision(validRequest);
    expect(result.decision_summary).toBe(validGeminiResponse.decision_summary);
    // Should have called twice: once for primary, once for fallback
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(mockGenerateContent.mock.calls[1][0].model).toBe("gemini-3.5-flash-lite");
  });

  it("handles guardrail violation by retrying with strict instructions or scrubbing text", async () => {
    const violatingResponse = {
      ...validGeminiResponse,
      observation: "Taking everything into account, you should accept the internship.",
    };

    // Call returns text with 'you should' violation
    mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(violatingResponse) });

    const result = await analyzeDecision(validRequest);
    expect(result.observation).not.toContain("you should");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("runs follow-up reflection analysis", async () => {
    const followupResponse = {
      reflection_summary: "Your answers highlight an inclination to prioritize long-term credentials.",
      what_shifted: ["Clarity on university policy"],
      new_blind_spots: [
        {
          category: "Health",
          factor: "Burnout under 50hr/wk",
          why_it_matters: "Impairs GPA",
          severity: "medium" as const,
        },
      ],
      remaining_questions: [
        {
          question: "Can the company commit in writing to a 40-hour limit?",
          probes: ["Will overtime be compensated?"],
        },
      ],
      safety_flag: false,
    };

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(followupResponse),
    });

    const res = await followupReflection({
      decision: "Startup internship",
      previousObservation: "Context",
      answers: [{ question: "Can you delay?", answer: "Yes, but with tuition penalty." }],
      tone: "Alfred",
    });

    expect(res.what_shifted).toContain("Clarity on university policy");
    expect(res.new_blind_spots).toHaveLength(1);
  });
});
