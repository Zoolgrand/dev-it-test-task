import type { CatalogSort } from "@/domain/product/catalogSort";
import { catalogMessages } from "./catalog";

export const catalogSortLabels: Record<CatalogSort, string> = {
  popular: catalogMessages.sortPopular,
  "price-asc": catalogMessages.sortPriceAsc,
  "price-desc": catalogMessages.sortPriceDesc,
  rating: catalogMessages.sortRating,
  new: catalogMessages.sortNew,
};
