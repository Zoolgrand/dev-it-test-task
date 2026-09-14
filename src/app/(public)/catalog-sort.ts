import { messages } from "@/lib/messages";

export const CATALOG_SORTS = ["popular", "price-asc", "price-desc", "rating", "new"] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number];

export const catalogSortLabels: Record<CatalogSort, string> = {
  popular: messages.catalog.sortPopular,
  "price-asc": messages.catalog.sortPriceAsc,
  "price-desc": messages.catalog.sortPriceDesc,
  rating: messages.catalog.sortRating,
  new: messages.catalog.sortNew,
};

export function isCatalogSort(value: string): value is CatalogSort {
  return CATALOG_SORTS.some((sort) => sort === value);
}
