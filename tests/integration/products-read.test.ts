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

    expect(await listAdminProducts()).toHaveLength(2);
  });

  it("orders the admin list by name", async () => {
    await createProduct({ name: "Бета" });
    await createProduct({ name: "Альфа" });

    expect((await listAdminProducts()).map((item) => item.name)).toEqual(["Альфа", "Бета"]);
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
