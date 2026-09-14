import type { Suggestion } from "@/domain/product/suggestion";

export type SuggestionInput = {
  name: string;
  attributes: Array<{ name: string; value: string }>;
};

export type SuggestionOutcome =
  { status: "ok"; suggestion: Suggestion } | { status: "unusable" } | { status: "unavailable" };

export type SuggestionProvider = {
  readonly mode: "live" | "mock";
  suggest(input: SuggestionInput, signal: AbortSignal): Promise<SuggestionOutcome>;
};
