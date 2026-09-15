import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { isRateLimited } from "@/lib/security/rate-limit";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("rate limiter", () => {
  it("allows requests within the window", () => {
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited("a", { limit: 5, windowMs: 1000 })).toBe(false);
    }
  });

  it("blocks when the window budget is exceeded", () => {
    for (let i = 0; i < 10; i++) {
      isRateLimited("b", { limit: 10, windowMs: 1000 });
    }
    expect(isRateLimited("b", { limit: 10, windowMs: 1000 })).toBe(true);
  });

  it("resets the budget after the window elapses", () => {
    for (let i = 0; i < 5; i++) {
      isRateLimited("c", { limit: 5, windowMs: 1000 });
    }
    expect(isRateLimited("c", { limit: 5, windowMs: 1000 })).toBe(true);

    vi.advanceTimersByTime(1100);

    expect(isRateLimited("c", { limit: 5, windowMs: 1000 })).toBe(false);
  });

  it("separates buckets by key", () => {
    for (let i = 0; i < 3; i++) {
      isRateLimited("d1", { limit: 3, windowMs: 1000 });
    }
    expect(isRateLimited("d1", { limit: 3, windowMs: 1000 })).toBe(true);
    expect(isRateLimited("d2", { limit: 3, windowMs: 1000 })).toBe(false);
  });
});