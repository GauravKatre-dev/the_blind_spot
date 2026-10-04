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

export const SeverityEnum = z.preprocess((val) => {
  if (typeof val === "string") {
    const lower = val.toLowerCase().trim();
    if (lower.includes("high") || lower.includes("crit")) return "high";
    if (lower.includes("low") || lower.includes("min")) return "low";
    return "medium";
  }
  return "medium";
}, z.enum(["low", "medium", "high"]));

export const AssumptionSchema = z.object({
  assumption: z.string().default(""),
  why_it_matters: z.string().default(""),
  how_to_test: z.string().default(""),
});

export const OverlookedFactorSchema = z.object({
  category: z.string().default("General"),
  factor: z.string().default(""),
  why_it_matters: z.string().default(""),
  severity: SeverityEnum.default("medium"),
});

export const InternalConflictSchema = z.object({
  statement_a: z.string().default(""),
  statement_b: z.string().default(""),
  tension: z.string().default(""),
});

export const BiasFlagSchema = z.object({
  bias: z.string().default(""),
  evidence_quote: z.string().default(""),
  note: z.string().default(""),
});

export const QuestionSchema = z.object({
  question: z.string().default(""),
  probes: z.array(z.string()).nullish().transform((v) => v || []),
});

export const AnalysisResultSchema = z.object({
  observation: z.string().default(""),
  decision_summary: z.string().default(""),
  stated_reasons: z.array(z.string()).nullish().transform((v) => v || []),
  assumptions: z.array(AssumptionSchema).nullish().transform((v) => v || []),
  overlooked_factors: z.array(OverlookedFactorSchema).nullish().transform((v) => v || []),
  internal_conflicts: z.array(InternalConflictSchema).nullish().transform((v) => v || []),
  bias_flags: z.array(BiasFlagSchema).nullish().transform((v) => v || []),
  questions: z.array(QuestionSchema).nullish().transform((v) => v || []),
  missing_information: z.array(z.string()).nullish().transform((v) => v || []),
  safety_flag: z.boolean().nullish().transform((v) => !!v),
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
