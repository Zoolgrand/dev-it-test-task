import type { Suggestion, SuggestionMode } from "@/domain/product/suggestion";

export type SuggestionInput = {
  name: string;
  attributes: Array<{ name: string; value: string }>;
};

export type SuggestionOutcome =
  | { status: "ok"; suggestion: Suggestion }
  | { status: "unusable" }
  | { status: "rate_limited" }
  | { status: "unavailable" };

export type SuggestionProvider = {
  readonly mode: SuggestionMode;
  suggest(input: SuggestionInput, signal: AbortSignal): Promise<SuggestionOutcome>;
};
