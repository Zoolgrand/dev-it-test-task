import { describe, expect, it } from "vitest";
import { generateSessionId, isSessionExpired } from "@/server/auth/session";

describe("session id generation", () => {
  it("returns a different id on every call", () => {
    expect(generateSessionId()).not.toBe(generateSessionId());
  });

  it("returns an id of at least 43 characters", () => {
    expect(generateSessionId().length).toBeGreaterThanOrEqual(43);
  });

  it("returns an id made only of base64url characters", () => {
    expect(generateSessionId()).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("session expiry", () => {
  it("is not expired a millisecond before the boundary", () => {
    const expiresAt = new Date("2026-01-01T00:00:00.000Z");
    const now = new Date(expiresAt.getTime() - 1);

    expect(isSessionExpired(expiresAt, now)).toBe(false);
  });

  it("is expired exactly at the boundary", () => {
    const expiresAt = new Date("2026-01-01T00:00:00.000Z");
    const now = new Date("2026-01-01T00:00:00.000Z");

    expect(isSessionExpired(expiresAt, now)).toBe(true);
  });
});
