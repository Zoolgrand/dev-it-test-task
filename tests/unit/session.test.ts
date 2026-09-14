import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { generateSessionToken, hashSessionToken, isSessionExpired } from "@/server/auth/session";

describe("session token generation", () => {
  it("returns a different token on every call", () => {
    expect(generateSessionToken()).not.toBe(generateSessionToken());
  });

  it("returns a token of at least 43 characters", () => {
    expect(generateSessionToken().length).toBeGreaterThanOrEqual(43);
  });

  it("returns a token made only of base64url characters", () => {
    expect(generateSessionToken()).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("session token hashing", () => {
  it("turns a token into its sha-256 digest", () => {
    expect(hashSessionToken("test")).toBe(createHash("sha256").update("test").digest("hex"));
  });

  it("never returns the token itself", () => {
    const token = generateSessionToken();

    expect(hashSessionToken(token)).not.toBe(token);
  });

  it("gives two different tokens two different digests", () => {
    expect(hashSessionToken("first")).not.toBe(hashSessionToken("second"));
  });

  it("gives the same token the same digest, so a cookie can still be looked up", () => {
    const token = generateSessionToken();

    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
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
