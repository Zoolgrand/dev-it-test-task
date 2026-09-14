import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  DESCRIPTION_MAX_LENGTH,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from "@/domain/product/limits";
import { productContentSchema } from "@/domain/product/schema";
import { parseSuggestion, stripCodeFence } from "@/domain/product/suggestion";
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

  const entries = Object.entries(z.flattenError(parsed.error).fieldErrors);
  const [field, fieldMessages] = entries[0] ?? ["невідоме поле", []];

  return `поле ${field}: ${(fieldMessages as string[])[0] ?? "не пройшло перевірку"}`;
}

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

async function callModel(
  ai: GoogleGenAI,
  prompt: string,
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { abortSignal: signal },
    });

    return response.text ?? null;
  } catch {
    return null;
  }
}

async function callModelWithRetry(
  ai: GoogleGenAI,
  prompt: string,
  signal: AbortSignal,
): Promise<string | null> {
  const first = await callModel(ai, prompt, signal);

  if (first !== null) {
    return first;
  }

  try {
    await delay(TRANSIENT_RETRY_DELAY_MS, signal);
  } catch {
    return null;
  }

  return callModel(ai, prompt, signal);
}

export function createGeminiSuggestionProvider(apiKey: string): SuggestionProvider {
  const ai = new GoogleGenAI({ apiKey });

  return {
    mode: "live",
    async suggest(input: SuggestionInput, signal: AbortSignal): Promise<SuggestionOutcome> {
      const prompt = buildPrompt(input);
      const raw = await callModelWithRetry(ai, prompt, signal);

      if (raw === null) {
        return { status: "unavailable" };
      }

      const first = parseSuggestion(raw);

      if (first.status === "ok") {
        return first;
      }

      const violation = describeViolation(raw);
      const retryPrompt = violation
        ? `${prompt}\n\nПопередня відповідь порушила обмеження (${violation}). Виправ і поверни лише коректний JSON.`
        : prompt;

      const retryRaw = await callModelWithRetry(ai, retryPrompt, signal);

      return retryRaw === null ? { status: "unavailable" } : parseSuggestion(retryRaw);
    },
  };
}
