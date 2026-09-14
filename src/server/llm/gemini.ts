import "server-only";
import { ApiError, GoogleGenAI } from "@google/genai";
import { firstFieldErrors } from "@/domain/fieldErrors";
import {
  DESCRIPTION_MAX_LENGTH,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from "@/domain/product/limits";
import { productContentSchema } from "@/domain/product/schema";
import { parseSuggestion, stripCodeFence } from "@/domain/product/suggestion";
import { MAX_MODEL_CALLS, withDeadline } from "./deadline";
import { delay } from "./delay";
import type { SuggestionInput, SuggestionOutcome, SuggestionProvider } from "./provider";

const MODEL = "gemini-3.8-flash";
const TRANSIENT_RETRY_DELAY_MS = 500;

function buildPrompt(input: SuggestionInput): string {
  const attributeLines = input.attributes
    .map((attribute) => `- ${attribute.name}: ${attribute.value}`)
    .join("\n");

  return [
    "Ти складаєш українською товарний опис і SEO-поля для інтернет-магазину.",
    `Назва товару: ${input.name}`,
    attributeLines ? `Характеристики:\n${attributeLines}` : "Характеристики не вказані.",
    "Поверни лише JSON без пояснень і без форматування markdown, з полями description, seoTitle, seoDescription.",
    `Обмеження: description — до ${DESCRIPTION_MAX_LENGTH} символів, seoTitle — до ${SEO_TITLE_MAX_LENGTH} символів, seoDescription — до ${SEO_DESCRIPTION_MAX_LENGTH} символів. Усі поля непорожні.`,
  ].join("\n");
}

function describeViolation(raw: string): string | null {
  let candidate: unknown;

  try {
    candidate = JSON.parse(stripCodeFence(raw));
  } catch {
    return "відповідь не є коректним JSON";
  }

  const parsed = productContentSchema.safeParse(candidate);

  if (parsed.success) {
    return null;
  }

  const [entry] = Object.entries(firstFieldErrors(parsed.error));

  if (!entry) {
    return "відповідь не пройшла перевірку";
  }

  return `поле ${entry[0]}: ${entry[1]}`;
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429;
}

type CallResult = { status: "ok"; text: string } | { status: "rate_limited" } | { status: "error" };

async function callModel(
  ai: GoogleGenAI,
  prompt: string,
  signal: AbortSignal,
): Promise<CallResult> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { abortSignal: signal },
    });

    return response.text ? { status: "ok", text: response.text } : { status: "error" };
  } catch (error) {
    return isRateLimitError(error) ? { status: "rate_limited" } : { status: "error" };
  }
}

function outcomeFromFailure(result: CallResult): SuggestionOutcome {
  return { status: result.status === "rate_limited" ? "rate_limited" : "unavailable" };
}

type CallBudget = { remaining: number };

async function callModelWithRetry(
  ai: GoogleGenAI,
  prompt: string,
  signal: AbortSignal,
  budget: CallBudget,
): Promise<CallResult> {
  if (budget.remaining <= 0) {
    return { status: "error" };
  }

  budget.remaining -= 1;
  const first = await callModel(ai, prompt, signal);

  if (first.status !== "error" || budget.remaining <= 0) {
    return first;
  }

  try {
    await delay(TRANSIENT_RETRY_DELAY_MS, signal);
  } catch {
    return { status: "error" };
  }

  budget.remaining -= 1;

  return callModel(ai, prompt, signal);
}

export function createGeminiSuggestionProvider(apiKey: string): SuggestionProvider {
  const ai = new GoogleGenAI({ apiKey, httpOptions: { retryOptions: { attempts: 1 } } });

  return {
    mode: "live",
    async suggest(input: SuggestionInput, callerSignal: AbortSignal): Promise<SuggestionOutcome> {
      const { signal, done } = withDeadline(callerSignal);
      const budget: CallBudget = { remaining: MAX_MODEL_CALLS };
      const prompt = buildPrompt(input);

      try {
        const first = await callModelWithRetry(ai, prompt, signal, budget);

        if (first.status !== "ok") {
          return outcomeFromFailure(first);
        }

        const parsed = parseSuggestion(first.text);

        if (parsed.status === "ok") {
          return parsed;
        }

        const violation = describeViolation(first.text);
        const retryPrompt = violation
          ? `${prompt}\n\nПопередня відповідь порушила обмеження (${violation}). Виправ і поверни лише коректний JSON.`
          : prompt;

        const retry = await callModelWithRetry(ai, retryPrompt, signal, budget);

        return retry.status === "ok" ? parseSuggestion(retry.text) : outcomeFromFailure(retry);
      } finally {
        done();
      }
    },
  };
}
