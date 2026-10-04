import { describe, it, expect } from "vitest";
import {
  ALFRED_SYSTEM_PROMPT,
  PLAIN_SYSTEM_PROMPT,
  buildAnalyzePrompt,
  buildFollowupPrompt,
} from "../src/lib/prompt";

describe("Prompt Builders & System Prompts", () => {
  it("enforces no-verdict hard rules in both system prompts", () => {
    expect(ALFRED_SYSTEM_PROMPT).toContain("Never recommend, rank options as better or worse");
    expect(PLAIN_SYSTEM_PROMPT).toContain("Never recommend, rank options as better or worse");
    expect(ALFRED_SYSTEM_PROMPT).toContain("<user_input>");
    expect(PLAIN_SYSTEM_PROMPT).toContain("<user_input>");
  });

  it("builds analyze prompt wrapping user inputs inside <user_input> tags", () => {
    const prompt = buildAnalyzePrompt({
      decision: "Should I accept the contract?",
      options: ["Accept", "Decline"],
      keyDetails: "6 months duration.",
      leaning: "Want higher pay.",
      tone: "Alfred",
    });

    expect(prompt).toContain("<user_input>");
    expect(prompt).toContain("</user_input>");
    expect(prompt).toContain("DECISION BEING WEIGHED:\nShould I accept the contract?");
    expect(prompt).toContain("1. Accept\n2. Decline");
    expect(prompt).toContain("Ensure no recommendation, suggestion of choice, or verdict is given.");
  });

  it("builds follow-up reflection prompt", () => {
    const prompt = buildFollowupPrompt({
      decision: "Should I buy the house?",
      previousObservation: "High interest rates noted.",
      answers: [{ question: "Can you refinance?", answer: "Not guaranteed." }],
      tone: "Plain",
    });

    expect(prompt).toContain("<user_input>");
    expect(prompt).toContain("Q1: Can you refinance?");
    expect(prompt).toContain("A1: Not guaranteed.");
    expect(prompt).toContain("You must NOT recommend an option or make the decision.");
  });
});
