import { afterEach, describe, expect, it, vi } from "vitest";
import { getSuggestionAvailability } from "@/server/llm";

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
