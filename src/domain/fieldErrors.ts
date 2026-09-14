import { z } from "zod";
import type { FieldErrors } from "./errors";

export function firstFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const [field] = issue.path;

    if (typeof field === "string" && !(field in errors)) {
      errors[field] = issue.message;
    }
  }

  return errors;
}
