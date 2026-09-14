import "server-only";
import { createGeminiSuggestionProvider } from "./gemini";
import { mockSuggestionProvider } from "./mock";
import type { SuggestionProvider } from "./provider";

export type SuggestionAvailability =
  | { status: "available"; mode: "live" | "mock" }
  | { status: "unavailable"; reason: "missing_api_key" };

export function getSuggestionAvailability(): SuggestionAvailability {
  if (process.env.LLM_MODE !== "live") {
    return { status: "available", mode: "mock" };
  }

  return process.env.GEMINI_API_KEY
    ? { status: "available", mode: "live" }
    : { status: "unavailable", reason: "missing_api_key" };
}

export function getSuggestionProvider(): SuggestionProvider {
  if (process.env.LLM_MODE !== "live") {
    return mockSuggestionProvider;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("LLM_MODE=live requires GEMINI_API_KEY; falling back to the mock provider");
    return mockSuggestionProvider;
  }

  return createGeminiSuggestionProvider(apiKey);
}
