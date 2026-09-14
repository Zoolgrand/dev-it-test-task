import type { ProductStatus } from "@/domain/product/status";

export const statusMessages: Record<ProductStatus, string> = {
  draft: "Чернетка",
  published: "Опубліковано",
};
