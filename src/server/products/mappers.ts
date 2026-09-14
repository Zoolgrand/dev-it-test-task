import type {
  AdminProduct,
  AdminProductListItem,
  ProductAttributeView,
  PublicProduct,
} from "@/domain/product/dto";
import type { Prisma } from "../../../prisma/generated/client";

export type ProductRow = Prisma.ProductGetPayload<{ include: { attributes: true } }>;

export type ProductListRow = Prisma.ProductGetPayload<{
  select: {
    id: true;
    slug: true;
    name: true;
    status: true;
    updatedAt: true;
    attributes: { select: { name: true } };
  };
}>;

function toAttributeViews(attributes: ProductRow["attributes"]): ProductAttributeView[] {
  return attributes.map((attribute) => ({
    id: attribute.id,
    name: attribute.name,
    value: attribute.value,
  }));
}

export function toAdminProductListItem(row: ProductListRow): AdminProductListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.attributes[0]?.name ?? null,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toAdminProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
    attributes: toAttributeViews(row.attributes),
  };
}

export function toPublicProduct(row: ProductRow): PublicProduct {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    createdAt: row.createdAt.toISOString(),
    attributes: toAttributeViews(row.attributes),
  };
}
