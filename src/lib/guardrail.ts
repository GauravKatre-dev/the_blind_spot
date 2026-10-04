/**
 * Deterministic guardrail to ensure "Blind Spot" NEVER produces advice,
 * recommendations, or decisions for the user.
 *
 * Scans all text fields for prescriptive or steering language without requiring an LLM call.
 */

export const BANNED_PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /\byou should\b/i, label: "prescriptive 'you should'" },
  { regex: /\byou shouldn't\b|\byou should not\b/i, label: "prescriptive 'you should not'" },
  { regex: /\bi recommend\b|\bi would recommend\b/i, label: "prescriptive 'I recommend'" },
  { regex: /\bmy recommendation\b/i, label: "prescriptive 'my recommendation'" },
  { regex: /\bmy advice\b/i, label: "prescriptive 'my advice'" },
  { regex: /\bthe best (option|choice|path|decision|way forward)\b/i, label: "comparative verdict 'the best [option]'" },
  { regex: /\bgo with\b/i, label: "directive 'go with'" },
  { regex: /\byou must\b/i, label: "imperative 'you must'" },
  { regex: /\byou ought to\b/i, label: "prescriptive 'you ought to'" },
  { regex: /\bi suggest you (choose|pick|take|go)\b/i, label: "directive 'I suggest you choose'" },
  { regex: /\byour best bet\b/i, label: "evaluative 'your best bet'" },
  { regex: /\btake option\b/i, label: "directive 'take option'" },
  { regex: /\bi urge you to\b/i, label: "directive 'I urge you to'" },
  { regex: /\byou have to choose\b/i, label: "imperative 'you have to choose'" },
  { regex: /\bthe superior (option|choice)\b/i, label: "evaluative 'superior option'" },
];

export interface GuardrailCheckResult {
  passes: boolean;
  violations: string[];
}

/**
 * Recursively scans all string properties of an object or array for verdict/recommendation language.
 *
 * @param data Any data structure (object, array, primitive)
 * @returns Result object with `passes: boolean` and list of detected `violations`
 */
export function checkNoVerdict(data: unknown): GuardrailCheckResult {
  const violations: string[] = [];

  function scan(val: unknown, path: string) {
    if (typeof val === "string") {
      for (const pattern of BANNED_PATTERNS) {
        if (pattern.regex.test(val)) {
          violations.push(`Violation at [${path}]: matched ${pattern.label} in text: "${val.slice(0, 80)}..."`);
        }
      }
    } else if (Array.isArray(val)) {
      val.forEach((item, idx) => scan(item, `${path}[${idx}]`));
    } else if (val !== null && typeof val === "object") {
      for (const [k, v] of Object.entries(val)) {
        // Guardrails apply to AI reasoning and guidance, not quotes of user words
        if (["evidence_quote", "statement_a", "statement_b", "stated_reasons"].includes(k)) {
          continue;
        }
        scan(v, path ? `${path}.${k}` : k);
      }
    }
  }

  scan(data, "root");

  return {
    passes: violations.length === 0,
    violations,
  };
}
