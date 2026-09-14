import { beforeEach, describe, expect, it } from "vitest";
import { createProduct, truncateAll } from "../factories";
import { getAdminProduct, listAdminProducts } from "@/server/products/service";

describe("reading products for the administrator", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it("lists every product for the administrator, drafts included", async () => {
    await createProduct({ status: "draft" });
    await createProduct({ status: "published" });

    expect((await listAdminProducts()).items).toHaveLength(2);
  });

  it("puts the most recently updated product at the top of the admin list", async () => {
    await createProduct({ name: "Раніше" });
    await createProduct({ name: "Пізніше" });

    expect((await listAdminProducts()).items.map((item) => item.name)).toEqual([
      "Пізніше",
      "Раніше",
    ]);
  });

  it("returns null for an administrator product that does not exist", async () => {
    expect(await getAdminProduct("missing")).toBeNull();
  });

  it("returns the attributes of a product in their stored order", async () => {
    const created = await createProduct({
      attributes: [
        { name: "Матеріал", value: "Сталь" },
        { name: "Обʼєм", value: "1 л" },
      ],
    });

    const product = await getAdminProduct(created.id);

    expect(product?.attributes.map((attribute) => attribute.name)).toEqual(["Матеріал", "Обʼєм"]);
  });
});
