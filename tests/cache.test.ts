import { describe, it, expect, beforeEach } from "vitest";
import { generateCacheKey, getCachedAnalysis, setCachedAnalysis, _clearCache } from "../src/lib/cache";
import type { AnalysisResult } from "../src/lib/schema";

describe("TTL Cache with SHA-256 Hashing", () => {
  beforeEach(() => {
    _clearCache();
  });

  const mockAnalysis: AnalysisResult = {
    observation: "A delicate balance between time and reward.",
    decision_summary: "Evaluating career opportunities.",
    stated_reasons: ["Higher pay"],
    assumptions: [{ assumption: "A", why_it_matters: "B", how_to_test: "C" }],
    overlooked_factors: [{ category: "Social", factor: "Isolation", why_it_matters: "Mental health", severity: "medium" }],
    internal_conflicts: [{ statement_a: "Want freedom", statement_b: "Take demanding job", tension: "Less time" }],
    bias_flags: [{ bias: "Optimism bias", evidence_quote: "It will all work out", note: "Consider worst case" }],
    questions: [{ question: "What is your buffer?", probes: ["Savings count?"] }],
    missing_information: ["Healthcare details"],
    safety_flag: false,
  };

  it("produces deterministic SHA-256 keys regardless of property insertion order", () => {
    const obj1 = { b: 2, a: 1 };
    const obj2 = { a: 1, b: 2 };

    const key1 = generateCacheKey(obj1);
    const key2 = generateCacheKey(obj2);

    expect(key1).toBe(key2);
    expect(key1).toHaveLength(64);
  });

  it("caches and retrieves analysis results", () => {
    const key = generateCacheKey({ test: "internship" });
    setCachedAnalysis(key, mockAnalysis, 10000);

    const retrieved = getCachedAnalysis(key);
    expect(retrieved).toEqual(mockAnalysis);
  });

  it("expires cached entries after TTL", () => {
    const key = generateCacheKey({ test: "expired" });
    // Set TTL to 1ms
    setCachedAnalysis(key, mockAnalysis, -1);

    const retrieved = getCachedAnalysis(key);
    expect(retrieved).toBeNull();
  });
});
