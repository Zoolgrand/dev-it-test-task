import { randomUUID } from "node:crypto";
import { db } from "./db";

export type E2eProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  attributes: Array<{
    id: string;
    productId: string;
    name: string;
    value: string;
    position: number;
  }>;
};

export async function truncateProducts(): Promise<void> {
  await db.$executeRaw`TRUNCATE TABLE "ProductAttribute", "Product", "AttemptCounter" RESTART IDENTITY CASCADE`;
}

export async function createProduct(
  overrides: Partial<{
    name: string;
    slug: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    status: "draft" | "published";
    attributes: Array<{ name: string; value: string }>;
  }> = {},
): Promise<E2eProductRow> {
  const attributes = overrides.attributes ?? [{ name: "Матеріал", value: "Сталь" }];

  return db.product.create({
    data: {
      slug: overrides.slug ?? `product-${randomUUID()}`,
      name: overrides.name ?? "Тестовий товар",
      description: overrides.description ?? "Опис товару",
      seoTitle: overrides.seoTitle ?? "Заголовок",
      seoDescription: overrides.seoDescription ?? "Опис для пошуку",
      status: overrides.status ?? "draft",
      attributes: {
        create: attributes.map((attribute, position) => ({ ...attribute, position })),
      },
    },
    include: { attributes: { orderBy: { position: "asc" } } },
  });
}
