/**
 * In-memory sliding-window rate limiter for Blind Spot API routes.
 *
 * DESIGN & LIMITS:
 * - Window: 60 seconds (1 minute)
 * - Max Requests: 15 per window per client IP
 * - Memory cleanup: Stale records purged every 5 minutes to prevent memory leaks
 * - Note on Distributed Deployments: In a multi-instance autoscaled Cloud Run deployment,
 *   this in-memory store operates per-container. For distributed production clusters with high
 *   traffic, an external cache like Google Cloud Memorystore (Redis) is the recommended upgrade.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const ipMap = new Map<string, RateLimitRecord>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 15;

// Periodically clean up stale IPs every 5 minutes
let lastCleanup = Date.now();

function purgeExpired(now: number): void {
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  const cutoff = now - WINDOW_MS;
  for (const [ip, record] of ipMap.entries()) {
    record.timestamps = record.timestamps.filter((t) => t > cutoff);
    if (record.timestamps.length === 0) {
      ipMap.delete(ip);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks and updates rate limit for a client IP address.
 *
 * @param ip Client IP address or fallback identifier
 * @param maxRequests Optional custom request limit (defaults to 15)
 * @param windowMs Optional custom window in ms (defaults to 60000)
 * @returns RateLimitResult with allowed status, remaining requests, and reset seconds
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  purgeExpired(now);

  const key = ip || "unknown_ip";
  let record = ipMap.get(key);

  if (!record) {
    record = { timestamps: [] };
    ipMap.set(key, record);
  }

  // Remove timestamps outside window
  const cutoff = now - windowMs;
  record.timestamps = record.timestamps.filter((t) => t > cutoff);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

/**
 * Resets rate limit store (useful for testing).
 */
export function _resetRateLimitStore(): void {
  ipMap.clear();
}
