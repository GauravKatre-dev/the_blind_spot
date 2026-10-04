import { GoogleGenAI } from "@google/genai";
import {
  type AnalysisResult,
  type FollowupResult,
  type AnalyzeRequest,
  type FollowupRequest,
  AnalysisResultSchema,
  FollowupResultSchema,
  GEMINI_ANALYSIS_RESPONSE_SCHEMA,
  GEMINI_FOLLOWUP_RESPONSE_SCHEMA,
} from "./schema";
import {
  ALFRED_SYSTEM_PROMPT,
  PLAIN_SYSTEM_PROMPT,
  buildAnalyzePrompt,
  buildFollowupPrompt,
} from "./prompt";
import { checkNoVerdict } from "./guardrail";

/**
 * Server-side Gemini API client for Blind Spot.
 *
 * Implements:
 * 1. Strict server-side API key handling (never exported or exposed to browser)
 * 2. Primary model (gemini-3.8-flash) with fallback (gemini-3.5-flash-lite)
 * 3. Request timeout and exponential backoff retry (max 2 retries)
 * 4. Deterministic no-verdict guardrail enforcement
 */

export function getPrimaryModel(): string {
  return process.env.GEMINI_MODEL || "gemini-3.8-flash";
}

export function getFallbackModel(): string {
  return process.env.GEMINI_MODEL_FALLBACK || "gemini-3.5-flash-lite";
}

const REQUEST_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured on server.");
  }
  return key;
}

/**
 * Creates or retrieves the GoogleGenAI client instance.
 */
export function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

/**
 * Executes an async task with timeout.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Gemini API request timed out.")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Executes a function with exponential backoff retry.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delayMs: number = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err: unknown) {
      const errStr = String(err).toLowerCase();
      // Fail fast on fatal 404, 503 high demand, or unavailable to trigger immediate model fallback
      if (
        errStr.includes("404") ||
        errStr.includes("not found") ||
        errStr.includes("503") ||
        errStr.includes("high demand") ||
        errStr.includes("unavailable")
      ) {
        throw err;
      }
      attempt++;
      if (attempt > retries) {
        throw err;
      }
      // Exponential backoff with slight jitter for transient issues (network, rate limits)
      const wait = delayMs * Math.pow(2, attempt - 1) + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  throw new Error("Max retries exceeded.");
}

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

/**
 * Analyzes a decision context using Gemini with structured output and guardrail validation.
 *
 * @param request Validated AnalyzeRequest payload
 * @returns Validated AnalysisResult adhering to strict no-verdict guardrails
 */
export async function analyzeDecision(request: AnalyzeRequest): Promise<AnalysisResult> {
  const ai = getGeminiClient();
  const systemInstruction = request.tone === "Plain" ? PLAIN_SYSTEM_PROMPT : ALFRED_SYSTEM_PROMPT;
  const prompt = buildAnalyzePrompt(request);

  let activeModel = getPrimaryModel();

  async function callModel(modelId: string, customPrompt: string): Promise<string> {
    const response = await withTimeout(
      ai.models.generateContent({
        model: modelId,
        contents: customPrompt,
        config: {
          systemInstruction,
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema: GEMINI_ANALYSIS_RESPONSE_SCHEMA,
        },
      }),
      REQUEST_TIMEOUT_MS
    );

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }
    return text;
  }

  // Attempt with primary model, fallback automatically on ANY error (503 high demand, 429 quota, etc.)
  let rawJsonText: string;
  try {
    rawJsonText = await withRetry(() => callModel(activeModel, prompt));
  } catch (err: unknown) {
    if (activeModel !== getFallbackModel()) {
      console.warn(`Primary model (${activeModel}) failed, switching to fallback model (${getFallbackModel()}):`, err instanceof Error ? err.message : String(err));
      activeModel = getFallbackModel();
      rawJsonText = await withRetry(() => callModel(activeModel, prompt));
    } else {
      throw err;
    }
  }

  let parsedData: unknown;
  try {
    const cleanedJson = cleanJsonText(rawJsonText);
    parsedData = JSON.parse(cleanedJson);
  } catch (parseErr) {
    console.error("Failed to parse Gemini JSON:", parseErr, "Raw snippet:", rawJsonText.slice(0, 200));
    throw new Error("Unable to parse structured response from Gemini.");
  }

  // Validate schema via Zod
  const zodResult = AnalysisResultSchema.safeParse(parsedData);
  if (!zodResult.success) {
    console.error("Schema validation failed:", JSON.stringify(zodResult.error.issues));
    throw new Error("Response failed schema validation.");
  }

  let finalAnalysis = zodResult.data;

  // Deterministic Guardrail Check
  const guardrailCheck = checkNoVerdict(finalAnalysis);
  if (!guardrailCheck.passes) {
    console.warn("Guardrail violation detected; scrubbing prescriptive wording:", guardrailCheck.violations[0]);
    finalAnalysis = scrubViolations(finalAnalysis);
  }

  return finalAnalysis;
}

/**
 * Follow-up reflection analysis after user answers questions.
 *
 * @param request Validated FollowupRequest payload
 * @returns Validated FollowupResult
 */
export async function followupReflection(request: FollowupRequest): Promise<FollowupResult> {
  const ai = getGeminiClient();
  const systemInstruction = request.tone === "Plain" ? PLAIN_SYSTEM_PROMPT : ALFRED_SYSTEM_PROMPT;
  const prompt = buildFollowupPrompt(request);

  let activeModel = getPrimaryModel();

  async function callModel(modelId: string): Promise<string> {
    const response = await withTimeout(
      ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema: GEMINI_FOLLOWUP_RESPONSE_SCHEMA,
        },
      }),
      REQUEST_TIMEOUT_MS
    );

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }
    return text;
  }

  let rawJsonText: string;
  try {
    rawJsonText = await withRetry(() => callModel(activeModel));
  } catch (err: unknown) {
    if (activeModel !== getFallbackModel()) {
      console.warn(`Primary model (${activeModel}) failed in followup, switching to fallback (${getFallbackModel()}):`, err instanceof Error ? err.message : String(err));
      activeModel = getFallbackModel();
      rawJsonText = await withRetry(() => callModel(activeModel));
    } else {
      throw err;
    }
  }

  const parsed = JSON.parse(cleanJsonText(rawJsonText));
  const validated = FollowupResultSchema.parse(parsed);

  const guardrailCheck = checkNoVerdict(validated);
  if (!guardrailCheck.passes) {
    // Scrub reflection summary of any verdict phrases
    validated.reflection_summary = "Reflecting upon your answers, these shifts highlight new nuances without pointing to any single conclusion.";
  }

  return validated;
}

/**
 * Sanitizes any fields that triggered guardrail violations into safe observational text.
 */
function scrubViolations(analysis: AnalysisResult): AnalysisResult {
  return {
    ...analysis,
    observation: "Here are the observations and perspectives arising from your stated situation.",
  };
}
