import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import {
  getPublishedProduct,
  listPublishedCategories,
  listPublishedProducts,
} from "@/server/products/service";
import { createProduct, truncateAll } from "../factories";

describe("reading products for the public catalogue", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it("never includes a draft in the public catalogue", async () => {
    await createProduct({ status: "draft", name: "Чернетка" });
    await createProduct({ status: "published", name: "Опублікований" });

    const { items } = await listPublishedProducts();

    expect(items.map((product) => product.name)).toEqual(["Опублікований"]);
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

  it("offers each catalogue category once, however many products carry it", async () => {
    await createProduct({ status: "published", attributes: [{ name: "Тип", value: "Кухоль" }] });
    await createProduct({ status: "published", attributes: [{ name: "Тип", value: "Пляшка" }] });

    expect(await listPublishedCategories()).toEqual(["Тип"]);
  });

  it("orders the catalogue categories alphabetically", async () => {
    await createProduct({ status: "published", attributes: [{ name: "Розмір", value: "M" }] });
    await createProduct({ status: "published", attributes: [{ name: "Бренд", value: "Acme" }] });
    await createProduct({ status: "published", attributes: [{ name: "Матеріал", value: "Скло" }] });

    expect(await listPublishedCategories()).toEqual(["Бренд", "Матеріал", "Розмір"]);
  });

  it("never offers a category that only a draft carries", async () => {
    await createProduct({ status: "draft", attributes: [{ name: "Таємниця", value: "Так" }] });
    await createProduct({ status: "published", attributes: [{ name: "Бренд", value: "Acme" }] });

    expect(await listPublishedCategories()).toEqual(["Бренд"]);
  });

  it("treats only the leading attribute of a product as its category", async () => {
    await createProduct({
      status: "published",
      attributes: [
        { name: "Бренд", value: "Acme" },
        { name: "Вага", value: "300 г" },
      ],
    });

    expect(await listPublishedCategories()).toEqual(["Бренд"]);
  });
});
