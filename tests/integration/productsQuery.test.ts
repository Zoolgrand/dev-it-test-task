import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { listAdminProducts, listPublishedProducts } from "@/server/products/service";
import { createProduct, truncateAll } from "../factories";

describe("querying product lists", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns only the page the caller asked for and reports the total behind it", async () => {
    await createProduct({ name: "Альфа", status: "published" });
    await createProduct({ name: "Бета", status: "published" });
    await createProduct({ name: "Гамма", status: "published" });

    const page = await listAdminProducts({ skip: 1, take: 1 });

    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.name).toBe("Бета");
    expect(page.total).toBe(3);
  });

  it("filters by status in the query, not after the fact", async () => {
    await createProduct({ name: "Опублікований", status: "published" });
    await createProduct({ name: "Чернетка", status: "draft" });

    const page = await listAdminProducts({ status: "draft" });

    expect(page.items.map((product) => product.name)).toEqual(["Чернетка"]);
    expect(page.total).toBe(1);
  });

  it("matches a search term against the name and the slug, ignoring case", async () => {
    await createProduct({ name: "Ноутбук Pro", slug: "noutbuk-pro", status: "published" });
    await createProduct({ name: "Термокухоль", slug: "termokukhol", status: "published" });

    expect((await listAdminProducts({ query: "НОУТБУК" })).items).toHaveLength(1);
    expect((await listAdminProducts({ query: "termo" })).items).toHaveLength(1);
    expect((await listAdminProducts({ query: "нічого" })).items).toHaveLength(0);
  });

  it("counts published and draft products without loading either list", async () => {
    await createProduct({ status: "published" });
    await createProduct({ status: "published" });
    await createProduct({ status: "draft" });

    expect(await prisma.product.count()).toBe(3);
    const counts = await listAdminProducts({ take: 0 });

    expect(counts.publishedCount).toBe(2);
    expect(counts.draftCount).toBe(1);
  });

  it("orders the public catalogue newest first when asked", async () => {
    await createProduct({ name: "Старий", slug: "staryi", status: "published" });
    await new Promise((resolve) => setTimeout(resolve, 10));
    await createProduct({ name: "Новий", slug: "novyi", status: "published" });

    const page = await listPublishedProducts({ sort: "newest" });

    expect(page.items[0]?.name).toBe("Новий");
  });

  it("never returns a draft to the public catalogue, whatever the filter", async () => {
    await createProduct({ name: "Чернетка", status: "draft" });

    const page = await listPublishedProducts({ query: "Чернетка" });

    expect(page.items).toHaveLength(0);
    expect(page.total).toBe(0);
  });
});
