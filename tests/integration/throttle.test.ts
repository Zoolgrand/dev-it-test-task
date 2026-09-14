import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { createAttemptThrottle } from "@/server/throttle";
import { truncateAll } from "../factories";

const WINDOW_MS = 900_000;

describe("login throttling", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("allows attempts up to the limit and blocks the next one", async () => {
    const throttle = createAttemptThrottle({
      scope: "email",
      limit: 5,
      windowMs: WINDOW_MS,
      clock: () => 0,
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(await throttle.isAllowed("user@example.com")).toBe(true);
      await throttle.recordAttempt("user@example.com");
    }

    expect(await throttle.isAllowed("user@example.com")).toBe(false);
  });

  it("counts each key separately", async () => {
    const throttle = createAttemptThrottle({
      scope: "email",
      limit: 1,
      windowMs: WINDOW_MS,
      clock: () => 0,
    });
    await throttle.recordAttempt("first@example.com");

    expect(await throttle.isAllowed("first@example.com")).toBe(false);
    expect(await throttle.isAllowed("second@example.com")).toBe(true);
  });

  it("keeps the budgets of two scopes apart even for the same key", async () => {
    const clock = (): number => 0;
    const email = createAttemptThrottle({ scope: "email", limit: 1, windowMs: WINDOW_MS, clock });
    const address = createAttemptThrottle({ scope: "ip", limit: 1, windowMs: WINDOW_MS, clock });
    await email.recordAttempt("shared-key");

    expect(await email.isAllowed("shared-key")).toBe(false);
    expect(await address.isAllowed("shared-key")).toBe(true);
  });

  it("allows attempts again once the window has passed", async () => {
    let now = 0;
    const throttle = createAttemptThrottle({
      scope: "email",
      limit: 1,
      windowMs: WINDOW_MS,
      clock: () => now,
    });
    await throttle.recordAttempt("user@example.com");
    expect(await throttle.isAllowed("user@example.com")).toBe(false);

    now = WINDOW_MS + 1;

    expect(await throttle.isAllowed("user@example.com")).toBe(true);
  });

  it("forgets the failures of a successful login", async () => {
    const throttle = createAttemptThrottle({
      scope: "email",
      limit: 1,
      windowMs: WINDOW_MS,
      clock: () => 0,
    });
    await throttle.recordAttempt("user@example.com");
    await throttle.reset("user@example.com");

    expect(await throttle.isAllowed("user@example.com")).toBe(true);
  });

  it("survives a restart, because the counters live in the database", async () => {
    const options = { scope: "email" as const, limit: 1, windowMs: WINDOW_MS, clock: () => 0 };
    await createAttemptThrottle(options).recordAttempt("user@example.com");

    const afterRestart = createAttemptThrottle(options);

    expect(await afterRestart.isAllowed("user@example.com")).toBe(false);
  });

  it("drops expired counters so that abandoned keys cannot accumulate", async () => {
    let now = 0;
    const throttle = createAttemptThrottle({
      scope: "email",
      limit: 1,
      windowMs: WINDOW_MS,
      clock: () => now,
    });
    await throttle.recordAttempt("abandoned@example.com");

    now = WINDOW_MS + 1;
    const removed = await throttle.sweepExpired();

    expect(removed).toBe(1);
    expect(await prisma.attemptCounter.count()).toBe(0);
  });
});
