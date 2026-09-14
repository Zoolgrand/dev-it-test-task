import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { SUGGESTION_LIMIT, requestSuggestion } from "@/server/products/suggestionService";
import { createAdmin, createProduct, truncateAll } from "../factories";

function neverAborted(): AbortSignal {
  return new AbortController().signal;
}

const BUDGET_LOOP_TIMEOUT_MS = 30_000;

describe("suggestion requests", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("builds a suggestion from the product the caller named", async () => {
    const admin = await createAdmin();
    const product = await createProduct({ name: "Термокухоль" });

    const outcome = await requestSuggestion({
      productId: product.id,
      userId: admin.id,
      signal: neverAborted(),
    });

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") throw new Error("expected a suggestion");
    expect(outcome.suggestion.description).toContain("Термокухоль");
    expect(outcome.mode).toBe("mock");
  });

  it("reports a missing product without spending a request from the budget", async () => {
    const admin = await createAdmin();

    const outcome = await requestSuggestion({
      productId: "missing",
      userId: admin.id,
      signal: neverAborted(),
    });

    expect(outcome.status).toBe("not_found");
    expect(await prisma.attemptCounter.count()).toBe(0);
  });

  it(
    "stops an admin who loops the endpoint past the per-user budget",
    async () => {
      const admin = await createAdmin();
      const product = await createProduct();

      for (let attempt = 0; attempt < SUGGESTION_LIMIT; attempt += 1) {
        const outcome = await requestSuggestion({
          productId: product.id,
          userId: admin.id,
          signal: neverAborted(),
        });
        expect(outcome.status).toBe("ok");
      }

      const blocked = await requestSuggestion({
        productId: product.id,
        userId: admin.id,
        signal: neverAborted(),
      });

      expect(blocked.status).toBe("rate_limited");
    },
    BUDGET_LOOP_TIMEOUT_MS,
  );

  it(
    "gives every admin their own budget",
    async () => {
      const first = await createAdmin();
      const second = await createAdmin();
      const product = await createProduct();

      for (let attempt = 0; attempt < SUGGESTION_LIMIT; attempt += 1) {
        await requestSuggestion({
          productId: product.id,
          userId: first.id,
          signal: neverAborted(),
        });
      }

      const other = await requestSuggestion({
        productId: product.id,
        userId: second.id,
        signal: neverAborted(),
      });

      expect(other.status).toBe("ok");
    },
    BUDGET_LOOP_TIMEOUT_MS,
  );
});
