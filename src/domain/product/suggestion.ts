import { productContentSchema } from "./schema";
import type { ProductContent } from "./schema";

export type Suggestion = ProductContent;

export type SuggestionMode = "live" | "mock";

export type SuggestionAvailability =
  | { status: "available"; mode: SuggestionMode }
  | { status: "unavailable"; reason: "missing_api_key" };

export type ParseResult = { status: "ok"; suggestion: Suggestion } | { status: "unusable" };

const codeFencePattern = /^```(?:json)?\s*([\s\S]*?)\s*```$/;

export function stripCodeFence(raw: string): string {
  const match = codeFencePattern.exec(raw.trim());

  return match ? match[1] : raw;
}

export function parseSuggestion(raw: string): ParseResult {
  let candidate: unknown;

  try {
    candidate = JSON.parse(stripCodeFence(raw));
  } catch {
    return { status: "unusable" };
  }

  const parsed = productContentSchema.safeParse(candidate);

  if (!parsed.success) {
    return { status: "unusable" };
  }

  return { status: "ok", suggestion: parsed.data };
}
