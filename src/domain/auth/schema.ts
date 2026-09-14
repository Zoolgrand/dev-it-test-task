import { z } from "zod";
import { PASSWORD_MAX_LENGTH } from "./limits";

export const loginSchema = z.object({
  email: z.email("Вкажіть коректну електронну пошту"),
  password: z
    .string()
    .min(1, "Поле не може бути порожнім")
    .max(PASSWORD_MAX_LENGTH, `Пароль не може бути довшим за ${PASSWORD_MAX_LENGTH} символів`),
});

export type LoginInput = z.infer<typeof loginSchema>;
