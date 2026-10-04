import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, _resetRateLimitStore } from "../src/lib/rateLimit";

describe("Per-IP Rate Limiter", () => {
  beforeEach(() => {
    _resetRateLimitStore();
  });

  it("allows requests below the limit", () => {
    const ip = "192.168.1.100";
    const res = checkRateLimit(ip, 3, 5000);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(2);
  });

  it("blocks requests once the threshold is exceeded", () => {
    const ip = "10.0.0.1";
    checkRateLimit(ip, 2, 5000);
    checkRateLimit(ip, 2, 5000);

    const third = checkRateLimit(ip, 2, 5000);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.resetSeconds).toBeGreaterThan(0);
  });

  it("tracks different client IPs independently", () => {
    const ipA = "1.1.1.1";
    const ipB = "2.2.2.2";

    checkRateLimit(ipA, 1, 5000);
    const blockedA = checkRateLimit(ipA, 1, 5000);
    const allowedB = checkRateLimit(ipB, 1, 5000);

    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });
});
