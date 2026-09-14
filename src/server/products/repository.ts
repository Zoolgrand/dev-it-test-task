import "server-only";
import type { ProductContent } from "@/domain/product/schema";
import type { ProductStatus } from "@/domain/product/status";
import { prisma } from "@/server/db";
import { toAdminProduct } from "./mappers";
import type { AdminProduct } from "@/domain/product/dto";
import type { ProductListRow, ProductRow } from "./mappers";
import type { Prisma } from "../../../prisma/generated/client";

const attributeOrder = { orderBy: { position: "asc" } } as const;

const listSelect = {
  id: true,
  slug: true,
  name: true,
  status: true,
  updatedAt: true,
  attributes: { select: { name: true }, orderBy: { position: "asc" }, take: 1 },
} as const;

export type AdminListQuery = {
  status?: ProductStatus;
  query?: string;
  skip?: number;
  take?: number;
};

export type PublicListQuery = {
  category?: string;
  query?: string;
  orderBy?: "name" | "newest";
  skip?: number;
  take?: number;
};

export type AdminListPage = {
  rows: ProductListRow[];
  total: number;
  publishedCount: number;
  draftCount: number;
};

function adminWhere(options: AdminListQuery): Prisma.ProductWhereInput {
  const term = options.query?.trim();

  return {
    ...(options.status ? { status: options.status } : {}),
    ...(term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { slug: { contains: term, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

function publicWhere(options: PublicListQuery): Prisma.ProductWhereInput {
  const term = options.query?.trim();

  return {
    status: "published",
    ...(options.category ? { attributes: { some: { name: options.category } } } : {}),
    ...(term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function findAdminPage(options: AdminListQuery = {}): Promise<AdminListPage> {
  const where = adminWhere(options);
  const [rows, total, grouped] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: listSelect,
      skip: options.skip,
      take: options.take,
    }),
    prisma.product.count({ where }),
    prisma.product.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (status: ProductStatus): number =>
    grouped.find((entry) => entry.status === status)?._count._all ?? 0;

  return {
    rows,
    total,
    publishedCount: countFor("published"),
    draftCount: countFor("draft"),
  };
}

export async function findPublishedPage(
  options: PublicListQuery = {},
): Promise<{ rows: ProductRow[]; total: number }> {
  const where = publicWhere(options);
  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: options.orderBy === "newest" ? { createdAt: "desc" } : { name: "asc" },
      include: { attributes: attributeOrder },
      skip: options.skip,
      take: options.take,
    }),
    prisma.product.count({ where }),
  ]);

  return { rows, total };
}

export async function findPublishedCategories(): Promise<string[]> {
  const rows = await prisma.productAttribute.groupBy({
    by: ["name"],
    where: { position: 0, product: { status: "published" } },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => row.name);
}

export async function findByIdForAdmin(id: string): Promise<ProductRow | null> {
  return prisma.product.findUnique({ where: { id }, include: { attributes: attributeOrder } });
}

export async function findPublishedBySlug(slug: string): Promise<ProductRow | null> {
  return prisma.product.findFirst({
    where: { slug, status: "published" },
    include: { attributes: attributeOrder },
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
      include: { attributes: attributeOrder },
    });

    return { status: "updated" as const, product: toAdminProduct(row) };
  });
}
