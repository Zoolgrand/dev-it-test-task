import "server-only";
import { createGeminiSuggestionProvider } from "./gemini";
import { mockSuggestionProvider } from "./mock";
import type { SuggestionProvider } from "./provider";
import type { SuggestionAvailability } from "@/domain/product/suggestion";

export type ResolvedSuggestionProvider =
  | { status: "available"; provider: SuggestionProvider }
  | { status: "unavailable"; reason: "missing_api_key" };

const liveProviders = new Map<string, SuggestionProvider>();

function liveProviderFor(apiKey: string): SuggestionProvider {
  const existing = liveProviders.get(apiKey);

  if (existing) {
    return existing;
  }

  const provider = createGeminiSuggestionProvider(apiKey);
  liveProviders.set(apiKey, provider);

  return provider;
}

export function resolveSuggestionProvider(): ResolvedSuggestionProvider {
  if (process.env.LLM_MODE !== "live") {
    return { status: "available", provider: mockSuggestionProvider };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { status: "unavailable", reason: "missing_api_key" };
  }

  return { status: "available", provider: liveProviderFor(apiKey) };
}

export function getSuggestionAvailability(): SuggestionAvailability {
  const resolved = resolveSuggestionProvider();

  return resolved.status === "available"
    ? { status: "available", mode: resolved.provider.mode }
    : { status: "unavailable", reason: resolved.reason };
}
