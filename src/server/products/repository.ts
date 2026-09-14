import "server-only";
import { prisma } from "@/server/db";
import type { ProductRow } from "./mappers";

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
