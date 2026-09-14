import { describe, expect, it } from "vitest";
import { SEO_TITLE_MAX_LENGTH } from "@/domain/product/limits";
import { parseSuggestion } from "@/domain/product/suggestion";

describe("suggestion parsing", () => {
  it("accepts a well formed suggestion", () => {
    const result = parseSuggestion(
      JSON.stringify({ description: "Опис", seoTitle: "Заголовок", seoDescription: "Опис" }),
    );

    expect(result.status).toBe("ok");
  });

  it("rejects a suggestion with a missing field instead of throwing", () => {
    const result = parseSuggestion(JSON.stringify({ description: "Опис" }));

    expect(result.status).toBe("unusable");
  });

  it("rejects an seo title the model made too long", () => {
    const result = parseSuggestion(
      JSON.stringify({
        description: "Опис",
        seoTitle: "я".repeat(SEO_TITLE_MAX_LENGTH + 4),
        seoDescription: "Опис",
      }),
    );

    expect(result.status).toBe("unusable");
  });

  it("rejects text that is not json at all instead of throwing", () => {
    const result = parseSuggestion("вибачте, я не можу з цим допомогти");

    expect(result.status).toBe("unusable");
  });

  it("trims the values the model returned", () => {
    const result = parseSuggestion(
      JSON.stringify({ description: "  Опис  ", seoTitle: "Заголовок", seoDescription: "Опис" }),
    );

    expect(result.status === "ok" && result.suggestion.description).toBe("Опис");
  });

  it("strips a markdown code fence the model added around the json", () => {
    const raw = JSON.stringify({
      description: "Опис",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
    });
    const result = parseSuggestion(`\`\`\`json\n${raw}\n\`\`\``);

    expect(result.status).toBe("ok");
  });
});
