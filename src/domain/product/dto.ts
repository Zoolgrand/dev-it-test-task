import type { ProductStatus } from "./status";

export type ProductAttributeView = { id: string; name: string; value: string };

export type AdminProductListItem = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
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
  createdAt: string;
  attributes: ProductAttributeView[];
};
