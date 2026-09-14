import { z } from "zod";
import { DESCRIPTION_MAX_LENGTH, SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from "./limits";
import { PRODUCT_STATUSES } from "./status";

const required = "Поле не може бути порожнім";

function boundedText(max: number) {
  return z.string().trim().min(1, required).max(max, `Максимум ${max} символів`);
}

export const productContentSchema = z.object({
  description: boundedText(DESCRIPTION_MAX_LENGTH),
  seoTitle: boundedText(SEO_TITLE_MAX_LENGTH),
  seoDescription: boundedText(SEO_DESCRIPTION_MAX_LENGTH),
});

export const productUpdateSchema = productContentSchema.extend({
  status: z.enum(PRODUCT_STATUSES),
  expectedUpdatedAt: z.iso.datetime(),
});

export type ProductContent = z.infer<typeof productContentSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
