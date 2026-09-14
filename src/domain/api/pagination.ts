import { z } from "zod";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const ADMIN_PAGE_SIZE = 20;

const limitMessage = `Розмір сторінки має бути цілим числом від 1 до ${MAX_PAGE_SIZE}`;
const offsetMessage = "Зсув має бути невід'ємним цілим числом";

export const paginationSchema = z.object({
  limit: z.coerce
    .number(limitMessage)
    .int(limitMessage)
    .min(1, limitMessage)
    .max(MAX_PAGE_SIZE, limitMessage)
    .optional(),
  offset: z.coerce.number(offsetMessage).int(offsetMessage).min(0, offsetMessage).optional(),
});

export type Pagination = z.infer<typeof paginationSchema>;
