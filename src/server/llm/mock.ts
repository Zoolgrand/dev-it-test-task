import "server-only";
import {
  DESCRIPTION_MAX_LENGTH,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from "@/domain/product/limits";
import type { Suggestion } from "@/domain/product/suggestion";
import type { SuggestionInput, SuggestionOutcome, SuggestionProvider } from "./provider";

const MOCK_DELAY_MS = 400;

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function buildSuggestion(input: SuggestionInput): Suggestion {
  const attributeList = input.attributes
    .map((attribute) => `${attribute.name}: ${attribute.value}`)
    .join(", ");
  const description = attributeList
    ? `${input.name}. Характеристики: ${attributeList}.`
    : `${input.name}.`;

  return {
    description: description.slice(0, DESCRIPTION_MAX_LENGTH),
    seoTitle: input.name.slice(0, SEO_TITLE_MAX_LENGTH),
    seoDescription: description.slice(0, SEO_DESCRIPTION_MAX_LENGTH),
  };
}

export const mockSuggestionProvider: SuggestionProvider = {
  mode: "mock",
  async suggest(input: SuggestionInput, signal: AbortSignal): Promise<SuggestionOutcome> {
    try {
      await delay(MOCK_DELAY_MS, signal);
    } catch {
      return { status: "unavailable" };
    }

    return { status: "ok", suggestion: buildSuggestion(input) };
  },
};
