import { describe, it, expect } from "vitest";
import { checkNoVerdict } from "../src/lib/guardrail";

describe("Deterministic No-Verdict Guardrail", () => {
  it("passes clean observational content and questions", () => {
    const cleanData = {
      observation: "The dilemma involves weighing rapid short-term monetary compensation against long-term academic progress.",
      decision_summary: "Evaluating offer A versus remaining at current status.",
      questions: [
        {
          question: "How might deferring graduation affect your cohort relationships?",
          probes: ["What timeline does the registrar require for leave-of-absence requests?"],
        },
      ],
      assumptions: [
        {
          assumption: "Startup learning pace will exceed classroom curricula.",
          why_it_matters: "Practical exposure varies drastically by mentor availability.",
          how_to_test: "Consult previous interns from this company.",
        },
      ],
    };

    const res = checkNoVerdict(cleanData);
    expect(res.passes).toBe(true);
    expect(res.violations).toHaveLength(0);
  });

  it("detects 'you should' across various casing and sentence positions", () => {
    const dataWithShould = {
      observation: "Taking everything into account, you should accept the internship.",
    };

    const res = checkNoVerdict(dataWithShould);
    expect(res.passes).toBe(false);
    expect(res.violations.length).toBeGreaterThan(0);
    expect(res.violations[0]).toContain("prescriptive 'you should'");
  });

  it("detects 'I recommend' and 'my recommendation'", () => {
    const data1 = { summary: "I recommend rejecting the offer for now." };
    const data2 = { summary: "My recommendation is to keep your current car." };

    expect(checkNoVerdict(data1).passes).toBe(false);
    expect(checkNoVerdict(data2).passes).toBe(false);
  });

  it("detects 'the best option' and 'the best choice'", () => {
    const data = {
      notes: ["Clearly the best option is to stay in school."],
    };

    const res = checkNoVerdict(data);
    expect(res.passes).toBe(false);
    expect(res.violations[0]).toContain("the best [option]");
  });

  it("detects 'go with' directive", () => {
    const data = {
      recommendation: "Go with option 2 because it carries lower risk.",
    };

    expect(checkNoVerdict(data).passes).toBe(false);
  });

  it("detects 'you must' and 'your best bet'", () => {
    const data1 = { factor: "You must decline the contract immediately." };
    const data2 = { factor: "Your best bet is to negotiate higher equity." };

    expect(checkNoVerdict(data1).passes).toBe(false);
    expect(checkNoVerdict(data2).passes).toBe(false);
  });

  it("detects violations buried deeply in nested structures", () => {
    const nested = {
      level1: {
        level2: {
          items: [
            { text: "Neutral statement" },
            { text: "In this scenario, I suggest you choose the remote offer." },
          ],
        },
      },
    };

    const res = checkNoVerdict(nested);
    expect(res.passes).toBe(false);
    expect(res.violations[0]).toContain("level1.level2.items[1].text");
  });

  it("does not false-positive on legitimate words like 'shoulders' or 'recommendation letter'", () => {
    const benign = {
      observation: "This responsibility rests squarely on your shoulders.",
      context: "The professor agreed to provide a strong recommendation letter for graduate school.",
    };

    const res = checkNoVerdict(benign);
    expect(res.passes).toBe(true);
    expect(res.violations).toHaveLength(0);
  });
});
