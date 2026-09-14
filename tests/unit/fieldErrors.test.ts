import { describe, expect, it } from "vitest";
import { z } from "zod";
import { firstFieldErrors } from "@/domain/fieldErrors";

const schema = z.object({
  email: z.email("Вкажіть коректну електронну пошту"),
  password: z.string().min(8, "Замало символів").regex(/\d/, "Потрібна цифра"),
});

function errorFor(input: unknown): z.ZodError {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    throw new Error("expected the schema to reject this input");
  }

  return parsed.error;
}

describe("field error extraction", () => {
  it("reports one message per field, so a form can render it beside the input", () => {
    const errors = firstFieldErrors(errorFor({ email: "nope", password: "short" }));

    expect(errors).toEqual({
      email: "Вкажіть коректну електронну пошту",
      password: "Замало символів",
    });
  });

  it("keeps only the first message when a field breaks several rules", () => {
    const errors = firstFieldErrors(errorFor({ email: "a@b.co", password: "short" }));

    expect(errors).toEqual({ password: "Замало символів" });
  });

  it("omits the fields that passed", () => {
    const errors = firstFieldErrors(errorFor({ email: "a@b.co", password: "short" }));

    expect(errors.email).toBeUndefined();
  });
});
