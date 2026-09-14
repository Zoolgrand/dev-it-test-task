import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/server/auth/rate-limit";

describe("login rate limiting", () => {
  it("allows attempts up to the limit and blocks the next one", () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 900_000, clock: () => 0 });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(limiter.isAllowed("user@example.com")).toBe(true);
      limiter.recordFailure("user@example.com");
    }

    expect(limiter.isAllowed("user@example.com")).toBe(false);
  });

  it("counts each key separately", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 900_000, clock: () => 0 });
    limiter.recordFailure("first@example.com");

    expect(limiter.isAllowed("first@example.com")).toBe(false);
    expect(limiter.isAllowed("second@example.com")).toBe(true);
  });

  it("allows attempts again once the window has passed", () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 1, windowMs: 900_000, clock: () => now });
    limiter.recordFailure("user@example.com");
    expect(limiter.isAllowed("user@example.com")).toBe(false);

    now = 900_001;

    expect(limiter.isAllowed("user@example.com")).toBe(true);
  });

  it("forgets the failures of a successful login", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 900_000, clock: () => 0 });
    limiter.recordFailure("user@example.com");
    limiter.reset("user@example.com");

    expect(limiter.isAllowed("user@example.com")).toBe(true);
  });
});
