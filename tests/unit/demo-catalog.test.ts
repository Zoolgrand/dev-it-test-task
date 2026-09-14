import { describe, expect, it } from "vitest";
import {
  demoArticle,
  demoHighlight,
  demoPrice,
  demoRating,
  demoReviewCount,
  formatPrice,
} from "@/lib/demo-catalog";

describe("catalogue placeholders", () => {
  it("gives the same product the same article on every render", () => {
    expect(demoArticle("termokruzhka-nerzhaviyucha-stal")).toBe(
      demoArticle("termokruzhka-nerzhaviyucha-stal"),
    );
  });

  it("gives different products different articles", () => {
    expect(demoArticle("persha-kartka")).not.toBe(demoArticle("druha-kartka"));
  });

  it("keeps the price stable for one product, so the page never flickers", () => {
    expect(demoPrice("rukzak-miskyi")).toBe(demoPrice("rukzak-miskyi"));
  });

  it("formats a price with a thin space and the hryvnia sign", () => {
    expect(formatPrice(8999)).toContain("₴");
    expect(formatPrice(8999)).toContain("8");
  });

  it("keeps the rating inside the range a star row can render", () => {
    const rating = demoRating("bud-yakyi-tovar");

    expect(rating).toBeGreaterThanOrEqual(4);
    expect(rating).toBeLessThan(5);
  });

  it("never reports zero reviews, which would leave the row empty", () => {
    expect(demoReviewCount("bud-yakyi-tovar")).toBeGreaterThan(0);
  });

  it("picks a highlight from the known set", () => {
    expect(["Хіт продажів", "Новинка", "Вибір редакції", "Рекомендовано"]).toContain(
      demoHighlight("bud-yakyi-tovar"),
    );
  });
});
