import "server-only";
import type { Suggestion, SuggestionMode } from "@/domain/product/suggestion";
import { resolveSuggestionProvider } from "@/server/llm";
import { createAttemptThrottle } from "@/server/throttle";
import { getAdminProduct } from "./service";

export const SUGGESTION_LIMIT = 10;
const SUGGESTION_WINDOW_MS = 60 * 60 * 1000;

const suggestionThrottle = createAttemptThrottle({
  scope: "suggestion",
  limit: SUGGESTION_LIMIT,
  windowMs: SUGGESTION_WINDOW_MS,
});

export type SuggestionRequest = {
  productId: string;
  userId: string;
  signal: AbortSignal;
};

export type SuggestionRequestOutcome =
  | { status: "ok"; suggestion: Suggestion; mode: SuggestionMode }
  | { status: "not_found" }
  | { status: "rate_limited" }
  | { status: "unusable" }
  | { status: "unavailable" };

export async function requestSuggestion(
  input: SuggestionRequest,
): Promise<SuggestionRequestOutcome> {
  const product = await getAdminProduct(input.productId);

  if (!product) {
    return { status: "not_found" };
  }

  if (!(await suggestionThrottle.isAllowed(input.userId))) {
    return { status: "rate_limited" };
  }

  const resolved = resolveSuggestionProvider();

  if (resolved.status !== "available") {
    return { status: "unavailable" };
  }

  await suggestionThrottle.recordAttempt(input.userId);

  const outcome = await resolved.provider.suggest(
    { name: product.name, attributes: product.attributes },
    input.signal,
  );

  if (outcome.status === "ok") {
    return { status: "ok", suggestion: outcome.suggestion, mode: resolved.provider.mode };
  }

  return outcome;
}
