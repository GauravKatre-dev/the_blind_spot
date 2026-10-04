import { describe, it, expect } from "vitest";
import { DEMO_SCENARIOS } from "../src/lib/demoScenarios";
import { AnalyzeRequestSchema } from "../src/lib/schema";

describe("Demo Scenarios", () => {
  it("provides all 3 mandatory demo scenarios from the brief", () => {
    expect(DEMO_SCENARIOS).toHaveLength(3);
    const ids = DEMO_SCENARIOS.map((s) => s.id);
    expect(ids).toContain("internship-dilemma");
    expect(ids).toContain("financial-ev-purchase");
    expect(ids).toContain("relocation-partner");
  });

  it("validates all demo scenario requests against AnalyzeRequestSchema", () => {
    for (const scenario of DEMO_SCENARIOS) {
      const res = AnalyzeRequestSchema.safeParse(scenario.request);
      expect(res.success).toBe(true);
      expect(scenario.request.decision.length).toBeGreaterThan(10);
      expect(scenario.request.keyDetails.length).toBeGreaterThan(10);
      expect(scenario.request.leaning.length).toBeGreaterThan(10);
    }
  });
});
