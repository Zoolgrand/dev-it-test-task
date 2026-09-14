import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Вкажіть коректну електронну пошту"),
  password: z.string().min(1, "Поле не може бути порожнім"),
});

export type LoginInput = z.infer<typeof loginSchema>;
