import { randomUUID } from "node:crypto";
import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import type { ProductStatus } from "@/domain/product/status";
import type { ProductRow } from "@/server/products/mappers";

export async function truncateAll(): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE "ProductAttribute", "Product", "Session", "User", "AttemptCounter" RESTART IDENTITY CASCADE`;
}

export async function createAdmin(
  overrides: { email?: string; password?: string } = {},
): Promise<{ id: string; email: string; password: string }> {
  const email = overrides.email ?? `admin-${randomUUID()}@example.com`;
  const password = overrides.password ?? "factory-password";
  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });

  return { id: user.id, email, password };
}

export async function createProduct(
  overrides: Partial<{
    name: string;
    slug: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    status: ProductStatus;
    attributes: Array<{ name: string; value: string }>;
  }> = {},
): Promise<ProductRow> {
  const attributes = overrides.attributes ?? [{ name: "Матеріал", value: "Сталь" }];

  return prisma.product.create({
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
