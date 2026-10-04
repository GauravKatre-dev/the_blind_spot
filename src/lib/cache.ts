import crypto from "node:crypto";
import type { AnalysisResult } from "./schema";

/**
 * Lightweight in-memory TTL cache for identical decision inputs.
 * Avoids redundant Gemini API calls and improves efficiency score.
 */

interface CacheEntry {
  data: AnalysisResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generates a deterministic SHA-256 hash key for an input payload.
 *
 * @param payload Object containing decision, options, keyDetails, leaning, and tone
 * @returns 64-character hex hash string
 */
export function generateCacheKey(payload: Record<string, unknown>): string {
  const serialized = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

/**
 * Retrieves cached analysis result if present and unexpired.
 *
 * @param key SHA-256 cache key
 * @returns Cached AnalysisResult or null
 */
export function getCachedAnalysis(key: string): AnalysisResult | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Stores an analysis result in cache with TTL.
 *
 * @param key SHA-256 cache key
 * @param data AnalysisResult to store
 * @param ttlMs Time-to-live in milliseconds
 */
export function setCachedAnalysis(
  key: string,
  data: AnalysisResult,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });

  // Limit cache size to 100 entries max to prevent memory leakage
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
}

/**
 * Clears cache (useful in unit testing).
 */
export function _clearCache(): void {
  cache.clear();
}
