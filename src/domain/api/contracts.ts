import type { AdminProduct, AdminProductListItem, PublicProduct } from "../product/dto";
import type { Suggestion, SuggestionMode } from "../product/suggestion";

export type AdminProductResponse = { product: AdminProduct };

export type AdminProductListResponse = {
  products: AdminProductListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type PublicProductResponse = { product: PublicProduct };

export type PublicProductListResponse = {
  products: PublicProduct[];
  total: number;
  limit: number;
  offset: number;
};

export type SuggestionResponse = { suggestion: Suggestion; mode: SuggestionMode };

export type LoginResponse = { ok: true };
