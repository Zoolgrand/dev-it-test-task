import "server-only";
import { cache } from "react";
import type { AdminProduct, AdminProductListItem, PublicProduct } from "@/domain/product/dto";
import type { FieldErrors } from "@/domain/errors";
import { firstFieldErrors } from "@/domain/fieldErrors";
import { productUpdateSchema } from "@/domain/product/schema";
import type { ProductStatus } from "@/domain/product/status";
import {
  findAdminPage,
  findByIdForAdmin,
  findPublishedBySlug,
  findPublishedCategories,
  findPublishedPage,
  updateContent,
} from "./repository";
import { toAdminProduct, toAdminProductListItem, toPublicProduct } from "./mappers";

export type AdminProductList = {
  items: AdminProductListItem[];
  total: number;
  publishedCount: number;
  draftCount: number;
};

export type AdminListOptions = {
  status?: ProductStatus;
  query?: string;
  skip?: number;
  take?: number;
};

export async function listAdminProducts(options: AdminListOptions = {}): Promise<AdminProductList> {
  const page = await findAdminPage(options);

  return {
    items: page.rows.map(toAdminProductListItem),
    total: page.total,
    publishedCount: page.publishedCount,
    draftCount: page.draftCount,
  };
}

export type PublicListOptions = {
  category?: string;
  query?: string;
  sort?: "name" | "newest";
  skip?: number;
  take?: number;
};

export async function listPublishedProducts(
  options: PublicListOptions = {},
): Promise<{ items: PublicProduct[]; total: number }> {
  const page = await findPublishedPage({
    category: options.category,
    query: options.query,
    orderBy: options.sort === "newest" ? "newest" : "name",
    skip: options.skip,
    take: options.take,
  });

  return { items: page.rows.map(toPublicProduct), total: page.total };
}

export const listPublishedCategories = cache(async (): Promise<string[]> =>
  findPublishedCategories(),
);

export const getAdminProduct = cache(async (id: string): Promise<AdminProduct | null> => {
  const row = await findByIdForAdmin(id);

  return row ? toAdminProduct(row) : null;
});

export const getPublishedProduct = cache(async (slug: string): Promise<PublicProduct | null> => {
  const row = await findPublishedBySlug(slug);

  return row ? toPublicProduct(row) : null;
});

export type UpdateOutcome =
  | { status: "updated"; product: AdminProduct }
  | { status: "conflict" }
  | { status: "not_found" }
  | { status: "invalid"; fieldErrors: FieldErrors };

export async function updateProductContent(id: string, input: unknown): Promise<UpdateOutcome> {
  const parsed = productUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return { status: "invalid", fieldErrors: firstFieldErrors(parsed.error) };
  }

  return updateContent({
    id,
    expectedUpdatedAt: new Date(parsed.data.expectedUpdatedAt),
    data: {
      description: parsed.data.description,
      seoTitle: parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      status: parsed.data.status,
    },
  });
}
