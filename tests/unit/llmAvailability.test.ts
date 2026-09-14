import { afterEach, describe, expect, it, vi } from "vitest";
import { getSuggestionAvailability, resolveSuggestionProvider } from "@/server/llm";

describe("suggestion availability", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is available in mock mode without any key", () => {
    vi.stubEnv("LLM_MODE", "mock");
    vi.stubEnv("GEMINI_API_KEY", "");

    expect(getSuggestionAvailability()).toEqual({ status: "available", mode: "mock" });
  });

  it("is unavailable in live mode without a key, instead of crashing", () => {
    vi.stubEnv("LLM_MODE", "live");
    vi.stubEnv("GEMINI_API_KEY", "");

    expect(getSuggestionAvailability()).toEqual({
      status: "unavailable",
      reason: "missing_api_key",
    });
  });

  it("is available in live mode once a key is set", () => {
    vi.stubEnv("LLM_MODE", "live");
    vi.stubEnv("GEMINI_API_KEY", "test-key");

    expect(getSuggestionAvailability()).toEqual({ status: "available", mode: "live" });
  });
});

describe("suggestion provider resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuses to serve fabricated copy when a live key is missing", () => {
    vi.stubEnv("LLM_MODE", "live");
    vi.stubEnv("GEMINI_API_KEY", "");

    expect(resolveSuggestionProvider()).toEqual({
      status: "unavailable",
      reason: "missing_api_key",
    });
  });

  it("agrees with the availability the editor was rendered with", () => {
    vi.stubEnv("LLM_MODE", "live");
    vi.stubEnv("GEMINI_API_KEY", "");
    const availability = getSuggestionAvailability();
    const resolved = resolveSuggestionProvider();

    expect(resolved.status).toBe(availability.status);
  });

  it("serves the mock provider in mock mode", () => {
    vi.stubEnv("LLM_MODE", "mock");
    vi.stubEnv("GEMINI_API_KEY", "");
    const resolved = resolveSuggestionProvider();

    expect(resolved.status).toBe("available");
    if (resolved.status !== "available") throw new Error("expected an available provider");
    expect(resolved.provider.mode).toBe("mock");
  });

  it("reuses one live client instead of building a new one per request", () => {
    vi.stubEnv("LLM_MODE", "live");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const first = resolveSuggestionProvider();
    const second = resolveSuggestionProvider();

    if (first.status !== "available" || second.status !== "available") {
      throw new Error("expected an available provider");
    }
    expect(first.provider).toBe(second.provider);
  });
});
