import type { ProductStatus } from "@/domain/product/status";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: ProductStatus;
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

export type ProductAttributeView = { id: string; name: string; value: string };

export type AdminProductListItem = {
  id: string;
  name: string;
  status: ProductStatus;
  updatedAt: string;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: ProductStatus;
  updatedAt: string;
  attributes: ProductAttributeView[];
};

export type PublicProduct = {
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  attributes: ProductAttributeView[];
};

function toAttributeViews(attributes: ProductRow["attributes"]): ProductAttributeView[] {
  return attributes.map((attribute) => ({
    id: attribute.id,
    name: attribute.name,
    value: attribute.value,
  }));
}

export function toAdminProductListItem(row: ProductRow): AdminProductListItem {
  return {
    id: row.id,
    name: row.name,
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
    attributes: toAttributeViews(row.attributes),
  };
}
