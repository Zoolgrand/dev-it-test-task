import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { getPublishedProduct, listPublishedProducts } from "@/server/products/service";
import { createProduct, truncateAll } from "../factories";

describe("reading products for the public catalogue", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it("never includes a draft in the public catalogue", async () => {
    await createProduct({ status: "draft", name: "Чернетка" });
    await createProduct({ status: "published", name: "Опублікований" });

    const products = await listPublishedProducts();

    expect(products.map((product) => product.name)).toEqual(["Опублікований"]);
  });

  it("returns nothing for a draft requested by its slug", async () => {
    const draft = await createProduct({ status: "draft", slug: "chernetka" });

    expect(await getPublishedProduct(draft.slug)).toBeNull();
  });

  it("returns the product for a published slug", async () => {
    const published = await createProduct({ status: "published", slug: "opublikovanyi" });

    const found = await getPublishedProduct("opublikovanyi");

    expect(found?.name).toBe(published.name);
  });

  it("stops returning a product the moment it goes back to draft", async () => {
    const product = await createProduct({ status: "published", slug: "znyatyi" });
    await prisma.product.update({ where: { id: product.id }, data: { status: "draft" } });

    expect(await getPublishedProduct("znyatyi")).toBeNull();
  });
});
