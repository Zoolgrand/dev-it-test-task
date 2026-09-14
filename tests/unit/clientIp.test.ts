import { afterEach, describe, expect, it, vi } from "vitest";
import { readClientIp } from "@/server/http/clientIp";

function requestWith(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/auth/login", { method: "POST", headers });
}

function trustTheProxy(): void {
  vi.stubEnv("TRUST_PROXY_HEADERS", "1");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("client address resolution", () => {
  it("refuses a forwarding header no proxy of ours was configured to set", () => {
    vi.stubEnv("TRUST_PROXY_HEADERS", "");

    expect(readClientIp(requestWith({ "x-forwarded-for": "203.0.113.7" }))).toBeNull();
  });

  it("refuses a real-ip header no proxy of ours was configured to set", () => {
    vi.stubEnv("TRUST_PROXY_HEADERS", "");

    expect(readClientIp(requestWith({ "x-real-ip": "203.0.113.9" }))).toBeNull();
  });

  it("takes the originating address from a forwarding chain a trusted proxy sent", () => {
    trustTheProxy();
    const request = requestWith({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" });

    expect(readClientIp(request)).toBe("203.0.113.7");
  });

  it("trims the whitespace a proxy leaves around the address", () => {
    trustTheProxy();

    expect(readClientIp(requestWith({ "x-forwarded-for": "  203.0.113.7  " }))).toBe("203.0.113.7");
  });

  it("falls back to the real-ip header when no forwarding chain is present", () => {
    trustTheProxy();

    expect(readClientIp(requestWith({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("reports no address when a trusted proxy sent none", () => {
    trustTheProxy();

    expect(readClientIp(requestWith({}))).toBeNull();
  });

  it("reports no address rather than an empty key for a blank header", () => {
    trustTheProxy();

    expect(readClientIp(requestWith({ "x-forwarded-for": "  ,  " }))).toBeNull();
  });

  it("bounds the key length so a hostile header cannot bloat the counter table", () => {
    trustTheProxy();
    const address = readClientIp(requestWith({ "x-forwarded-for": "9".repeat(500) }));

    expect(address?.length).toBeLessThanOrEqual(64);
  });
});
