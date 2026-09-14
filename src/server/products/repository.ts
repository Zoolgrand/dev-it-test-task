import "server-only";
import type { ProductContent } from "@/domain/product/schema";
import type { ProductStatus } from "@/domain/product/status";
import { prisma } from "@/server/db";
import { toAdminProduct } from "./mappers";
import type { AdminProduct, ProductRow } from "./mappers";

export async function findAllForAdmin(): Promise<ProductRow[]> {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { attributes: { orderBy: { position: "asc" } } },
  });
}

export async function findByIdForAdmin(id: string): Promise<ProductRow | null> {
  return prisma.product.findUnique({
    where: { id },
    include: { attributes: { orderBy: { position: "asc" } } },
  });
}

export type UpdateContentInput = {
  id: string;
  expectedUpdatedAt: Date;
  data: ProductContent & { status: ProductStatus };
};

export type UpdateContentResult =
  { status: "updated"; product: AdminProduct } | { status: "conflict" } | { status: "not_found" };

export async function updateContent(input: UpdateContentInput): Promise<UpdateContentResult> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.product.updateMany({
      where: { id: input.id, updatedAt: input.expectedUpdatedAt },
      data: input.data,
    });

    if (result.count === 0) {
      const exists = await tx.product.findUnique({ where: { id: input.id }, select: { id: true } });
      return exists ? { status: "conflict" as const } : { status: "not_found" as const };
    }

    const row = await tx.product.findUniqueOrThrow({
      where: { id: input.id },
      include: { attributes: { orderBy: { position: "asc" } } },
    });

    return { status: "updated" as const, product: toAdminProduct(row) };
  });
}
