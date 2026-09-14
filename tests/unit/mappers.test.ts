import { describe, expect, it } from "vitest";
import type { ProductRow } from "@/server/products/mappers";
import { toAdminProduct, toAdminProductListItem, toPublicProduct } from "@/server/products/mappers";

const row: ProductRow = {
  id: "product-1",
  slug: "test-product",
  name: "Тестовий товар",
  description: "Опис",
  seoTitle: "Заголовок",
  seoDescription: "Опис для пошуку",
  status: "published",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  attributes: [
    { id: "attribute-1", productId: "product-1", name: "Матеріал", value: "Сталь", position: 0 },
  ],
};

describe("product mappers", () => {
  it("exposes exactly these fields to the public catalogue", () => {
    expect(Object.keys(toPublicProduct(row)).sort()).toMatchInlineSnapshot(`
      [
        "attributes",
        "description",
        "name",
        "seoDescription",
        "seoTitle",
        "slug",
      ]
    `);
  });

  it("exposes exactly these fields to the admin editor", () => {
    expect(Object.keys(toAdminProduct(row)).sort()).toMatchInlineSnapshot(`
      [
        "attributes",
        "description",
        "id",
        "name",
        "seoDescription",
        "seoTitle",
        "slug",
        "status",
        "updatedAt",
      ]
    `);
  });

  it("exposes exactly these fields in the admin list", () => {
    expect(Object.keys(toAdminProductListItem(row)).sort()).toMatchInlineSnapshot(`
      [
        "category",
        "id",
        "name",
        "slug",
        "status",
        "updatedAt",
      ]
    `);
  });

  it("never leaks the internal identifier to the public catalogue", () => {
    expect(toPublicProduct(row)).not.toHaveProperty("id");
    expect(toPublicProduct(row)).not.toHaveProperty("status");
  });

  it("serialises timestamps as strings, not Date objects", () => {
    expect(typeof toAdminProduct(row).updatedAt).toBe("string");
  });
});
