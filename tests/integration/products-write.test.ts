import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { updateProductContent } from "@/server/products/service";
import { createProduct, truncateAll } from "../factories";

describe("writing product content", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it("stores the new content and moves the update timestamp forward", async () => {
    const product = await createProduct({ description: "Старий опис" });

    const outcome = await updateProductContent(product.id, {
      description: "Новий опис",
      seoTitle: "Новий заголовок",
      seoDescription: "Новий опис для пошуку",
      status: "published",
      expectedUpdatedAt: product.updatedAt.toISOString(),
    });

    expect(outcome.status).toBe("updated");
    const stored = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(stored.description).toBe("Новий опис");
    expect(stored.updatedAt.getTime()).toBeGreaterThan(product.updatedAt.getTime());
  });

  it("leaves the row untouched when the submitted content is invalid", async () => {
    const product = await createProduct({ description: "Старий опис" });

    const outcome = await updateProductContent(product.id, {
      description: "   ",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
      status: "published",
      expectedUpdatedAt: product.updatedAt.toISOString(),
    });

    expect(outcome.status).not.toBe("updated");
    const stored = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(stored.description).toBe("Старий опис");
  });

  it("refuses a write based on a stale version and changes nothing", async () => {
    const product = await createProduct({ description: "Старий опис" });
    const stale = product.updatedAt.toISOString();
    await updateProductContent(product.id, {
      description: "Перша зміна",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
      status: "draft",
      expectedUpdatedAt: stale,
    });

    const outcome = await updateProductContent(product.id, {
      description: "Друга зміна",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
      status: "draft",
      expectedUpdatedAt: stale,
    });

    expect(outcome.status).toBe("conflict");
    const stored = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(stored.description).toBe("Перша зміна");
  });

  it("reports a missing product as not found, not as a conflict", async () => {
    const outcome = await updateProductContent("missing", {
      description: "Опис",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
      status: "draft",
      expectedUpdatedAt: new Date().toISOString(),
    });

    expect(outcome.status).toBe("not_found");
  });

  it("never changes the name or the attributes", async () => {
    const product = await createProduct({ name: "Початкова назва" });

    await updateProductContent(product.id, {
      description: "Новий опис",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
      status: "published",
      expectedUpdatedAt: product.updatedAt.toISOString(),
    });

    const stored = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
      include: { attributes: true },
    });
    expect(stored.name).toBe("Початкова назва");
    expect(stored.attributes).toHaveLength(product.attributes.length);
  });
});
