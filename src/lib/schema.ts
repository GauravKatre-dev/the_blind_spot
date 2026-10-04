import { z } from "zod";
import { escapePromptDelimiters } from "./sanitize";

/**
 * Single source of truth for all request and response schemas in Blind Spot.
 */

// ==========================================
// REQUEST SCHEMAS
// ==========================================

export const AnalyzeRequestSchema = z.object({
  decision: z
    .string()
    .min(3, "Please describe the decision you are considering (at least 3 characters).")
    .max(1000, "Decision summary is too long (maximum 1,000 characters).")
    .transform(escapePromptDelimiters),
  options: z
    .array(
      z
        .string()
        .max(300, "Option is too long (max 300 characters).")
        .transform(escapePromptDelimiters)
    )
    .max(10, "Maximum of 10 options allowed.")
    .default([]),
  keyDetails: z
    .string()
    .min(5, "Please provide some key context or details (at least 5 characters).")
    .max(2500, "Key details are too long (maximum 2,500 characters).")
    .transform(escapePromptDelimiters),
  leaning: z
    .string()
    .min(3, "Please describe what is currently driving your leaning (at least 3 characters).")
    .max(1000, "Leaning description is too long (maximum 1,000 characters).")
    .transform(escapePromptDelimiters),
  tone: z.enum(["Alfred", "Plain"]).default("Alfred"),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// Follow-up Q&A schema
export const FollowupAnswerSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(2000).transform(escapePromptDelimiters),
});

export const FollowupRequestSchema = z.object({
  decision: z.string().min(3).max(1000).transform(escapePromptDelimiters),
  previousObservation: z.string().max(1000).default(""),
  answers: z.array(FollowupAnswerSchema).min(1, "Please answer at least one question to reflect."),
  tone: z.enum(["Alfred", "Plain"]).default("Alfred"),
});

export type FollowupRequest = z.infer<typeof FollowupRequestSchema>;

// ==========================================
// RESPONSE SCHEMAS
// ==========================================

export const AssumptionSchema = z.object({
  assumption: z.string().describe("The unstated assumption identified from the user's reasoning."),
  why_it_matters: z.string().describe("Why this assumption creates risk or distortion in thinking."),
  how_to_test: z.string().describe("A practical way the user could test or verify this assumption."),
});

export const OverlookedFactorSchema = z.object({
  category: z.string().describe("Category e.g. Academic, Financial, Mentorship, Health, Social, Reversibility."),
  factor: z.string().describe("The specific factor omitted from the decision context."),
  why_it_matters: z.string().describe("The potential impact of neglecting this factor."),
  severity: z.enum(["low", "medium", "high"]).describe("The relative potential impact of this omission."),
});

export const InternalConflictSchema = z.object({
  statement_a: z.string().describe("The first priority or statement from the user."),
  statement_b: z.string().describe("The second priority or statement that clashes with statement A."),
  tension: z.string().describe("The specific friction or paradox between both priorities."),
});

export const BiasFlagSchema = z.object({
  bias: z.string().describe("Cognitive bias name (e.g. Present Bias, Sunk Cost, Availability Heuristic)."),
  evidence_quote: z.string().describe("Exact or near-exact quote from user input exhibiting the pattern."),
  note: z.string().describe("Tentative observation ('this may be', 'worth checking whether')."),
});

export const QuestionSchema = z.object({
  question: z.string().describe("An open, non-leading inquiry designed to reveal blind spots."),
  probes: z.array(z.string()).describe("Specific sub-questions to dig deeper."),
});

export const AnalysisResultSchema = z.object({
  observation: z.string().describe("2 to 3 sentences opening observation, calm, dry-witted if Alfred, neutral if Plain."),
  decision_summary: z.string().describe("A concise, objective recap of the decision being weighed."),
  stated_reasons: z.array(z.string()).describe("Direct factors and justifications explicitly stated by the user."),
  assumptions: z.array(AssumptionSchema).describe("Unstated assumptions underlying the decision."),
  overlooked_factors: z.array(OverlookedFactorSchema).describe("Factors not mentioned that carry consequence."),
  internal_conflicts: z.array(InternalConflictSchema).describe("Direct tensions between stated goals or statements."),
  bias_flags: z.array(BiasFlagSchema).describe("Tentative cognitive bias observations grounded in quotes."),
  questions: z.array(QuestionSchema).describe("3 to 5 open inquiry questions ordered by significance."),
  missing_information: z.array(z.string()).describe("Information gaps that would be needed for a fuller picture."),
  safety_flag: z.boolean().describe("True only if user indicates crisis, self-harm, or immediate danger."),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type Assumption = z.infer<typeof AssumptionSchema>;
export type OverlookedFactor = z.infer<typeof OverlookedFactorSchema>;
export type InternalConflict = z.infer<typeof InternalConflictSchema>;
export type BiasFlag = z.infer<typeof BiasFlagSchema>;
export type QuestionItem = z.infer<typeof QuestionSchema>;

export const FollowupResultSchema = z.object({
  reflection_summary: z.string().describe("2 to 3 sentences reflecting on how the user's answers shifted the context."),
  what_shifted: z.array(z.string()).describe("Shifts or clarifications that emerged from the user's answers."),
  new_blind_spots: z.array(OverlookedFactorSchema).describe("Newly revealed blind spots or secondary considerations."),
  remaining_questions: z.array(QuestionSchema).describe("Remaining open questions to contemplate."),
  safety_flag: z.boolean().describe("True if distress or crisis is indicated."),
});

export type FollowupResult = z.infer<typeof FollowupResultSchema>;

// ==========================================
// GEMINI API STRUCTURED JSON RESPONSE SCHEMAS
// ==========================================

export const GEMINI_ANALYSIS_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    observation: { type: "STRING" },
    decision_summary: { type: "STRING" },
    stated_reasons: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    assumptions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          assumption: { type: "STRING" },
          why_it_matters: { type: "STRING" },
          how_to_test: { type: "STRING" },
        },
        required: ["assumption", "why_it_matters", "how_to_test"],
      },
    },
    overlooked_factors: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          category: { type: "STRING" },
          factor: { type: "STRING" },
          why_it_matters: { type: "STRING" },
          severity: { type: "STRING", enum: ["low", "medium", "high"] },
        },
        required: ["category", "factor", "why_it_matters", "severity"],
      },
    },
    internal_conflicts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          statement_a: { type: "STRING" },
          statement_b: { type: "STRING" },
          tension: { type: "STRING" },
        },
        required: ["statement_a", "statement_b", "tension"],
      },
    },
    bias_flags: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          bias: { type: "STRING" },
          evidence_quote: { type: "STRING" },
          note: { type: "STRING" },
        },
        required: ["bias", "evidence_quote", "note"],
      },
    },
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          probes: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["question", "probes"],
      },
    },
    missing_information: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    safety_flag: { type: "BOOLEAN" },
  },
  required: [
    "observation",
    "decision_summary",
    "stated_reasons",
    "assumptions",
    "overlooked_factors",
    "internal_conflicts",
    "bias_flags",
    "questions",
    "missing_information",
    "safety_flag",
  ],
};

export const GEMINI_FOLLOWUP_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    reflection_summary: { type: "STRING" },
    what_shifted: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    new_blind_spots: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          category: { type: "STRING" },
          factor: { type: "STRING" },
          why_it_matters: { type: "STRING" },
          severity: { type: "STRING", enum: ["low", "medium", "high"] },
        },
        required: ["category", "factor", "why_it_matters", "severity"],
      },
    },
    remaining_questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          probes: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["question", "probes"],
      },
    },
    safety_flag: { type: "BOOLEAN" },
  },
  required: ["reflection_summary", "what_shifted", "new_blind_spots", "remaining_questions", "safety_flag"],
};
