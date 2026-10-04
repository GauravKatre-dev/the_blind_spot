/**
 * Input sanitization and normalization utilities for Blind Spot.
 * Prevents delimiter escape attacks, controls input lengths, and normalizes unicode/whitespace.
 */

export const MAX_INPUT_LENGTH = 4000;
export const MAX_FIELD_LENGTH = 1500;

/**
 * Strips zero-width and control characters, normalizes Unicode to NFC form.
 *
 * @param input Raw string to sanitize
 * @returns Cleaned and normalized string
 */
export function sanitizeText(input: string): string {
  if (!input) return "";

  return input
    .normalize("NFC")
    // Remove invisible control characters except standard whitespace (newlines, tabs)
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

/**
 * Escapes custom XML delimiter tags in user input to prevent prompt injection breakouts.
 *
 * @param input Text that will be inserted between <user_input> tags
 * @returns Escaped text safe for prompt interpolation
 */
export function escapePromptDelimiters(input: string): string {
  const sanitized = sanitizeText(input);
  return sanitized
    .replace(/<\/?user_input>/gi, "[filtered-tag]")
    .replace(/<\/?system>/gi, "[filtered-tag]")
    .replace(/<\/?prompt>/gi, "[filtered-tag]");
}

/**
 * Validates and limits input length to prevent denial-of-service or token bloat.
 *
 * @param input Text to truncate
 * @param maxLength Maximum allowable characters
 * @returns Truncated text
 */
export function truncateInput(input: string, maxLength: number = MAX_FIELD_LENGTH): string {
  if (!input) return "";
  return input.slice(0, maxLength);
}
