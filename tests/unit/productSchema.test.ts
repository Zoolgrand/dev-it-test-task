import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  DESCRIPTION_MAX_LENGTH,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from "@/domain/product/limits";
import { productContentSchema, productUpdateSchema } from "@/domain/product/schema";

function content(overrides: Partial<Record<string, string>> = {}) {
  return {
    description: "Опис товару",
    seoTitle: "Заголовок",
    seoDescription: "Опис для пошукових систем",
    ...overrides,
  };
}

describe("product content validation", () => {
  it("accepts a description of exactly the maximum length", () => {
    const result = productContentSchema.safeParse(
      content({ description: "я".repeat(DESCRIPTION_MAX_LENGTH) }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects a description one character over the maximum", () => {
    const result = productContentSchema.safeParse(
      content({ description: "я".repeat(DESCRIPTION_MAX_LENGTH + 1) }),
    );

    expect(result.success).toBe(false);
  });

  it("accepts an seo title of exactly the maximum length", () => {
    const result = productContentSchema.safeParse(
      content({ seoTitle: "я".repeat(SEO_TITLE_MAX_LENGTH) }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects an seo title one character over the maximum", () => {
    const result = productContentSchema.safeParse(
      content({ seoTitle: "я".repeat(SEO_TITLE_MAX_LENGTH + 1) }),
    );

    expect(result.success).toBe(false);
  });

  it("accepts an seo description of exactly the maximum length", () => {
    const result = productContentSchema.safeParse(
      content({ seoDescription: "я".repeat(SEO_DESCRIPTION_MAX_LENGTH) }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects an seo description one character over the maximum", () => {
    const result = productContentSchema.safeParse(
      content({ seoDescription: "я".repeat(SEO_DESCRIPTION_MAX_LENGTH + 1) }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects whitespace as an empty field", () => {
    const result = productContentSchema.safeParse(content({ description: "   " }));

    expect(result.success).toBe(false);
  });

  it("stores the trimmed value, not the submitted one", () => {
    const result = productContentSchema.parse(content({ seoTitle: "  Заголовок  " }));

    expect(result.seoTitle).toBe("Заголовок");
  });

  it("rejects a status outside the allowed set", () => {
    const result = productUpdateSchema.safeParse({
      ...content(),
      status: "archived",
      expectedUpdatedAt: "2026-09-13T10:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  it("reports one message per invalid field", () => {
    const result = productContentSchema.safeParse(content({ seoTitle: "", seoDescription: "" }));

    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = Object.keys(z.flattenError(result.error).fieldErrors);
    expect(fields).toEqual(expect.arrayContaining(["seoTitle", "seoDescription"]));
  });
});
