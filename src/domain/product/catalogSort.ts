export const CATALOG_SORTS = ["popular", "price-asc", "price-desc", "rating", "new"] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number];

export function isCatalogSort(value: string): value is CatalogSort {
  return CATALOG_SORTS.some((sort) => sort === value);
}
