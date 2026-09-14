import "server-only";
import { productUpdateSchema } from "@/domain/product/schema";
import type { ProductUpdate } from "@/domain/product/schema";
import {
  findAllForAdmin,
  findAllPublished,
  findByIdForAdmin,
  findPublishedBySlug,
  updateContent,
} from "./repository";
import { toAdminProduct, toAdminProductListItem, toPublicProduct } from "./mappers";
import type { AdminProduct, AdminProductListItem, PublicProduct } from "./mappers";

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const rows = await findAllForAdmin();

  return rows.map(toAdminProductListItem);
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const row = await findByIdForAdmin(id);

  return row ? toAdminProduct(row) : null;
}

export async function listPublishedProducts(): Promise<PublicProduct[]> {
  const rows = await findAllPublished();

  return rows.map(toPublicProduct);
}

export async function getPublishedProduct(slug: string): Promise<PublicProduct | null> {
  const row = await findPublishedBySlug(slug);

  return row ? toPublicProduct(row) : null;
}

export type UpdateOutcome =
  | { status: "updated"; product: AdminProduct }
  | { status: "conflict" }
  | { status: "not_found" }
  | { status: "invalid" };

export async function updateProductContent(
  id: string,
  input: ProductUpdate,
): Promise<UpdateOutcome> {
  const parsed = productUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return { status: "invalid" };
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
