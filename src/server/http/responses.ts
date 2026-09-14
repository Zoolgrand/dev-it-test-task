import "server-only";
import { z } from "zod";
import type { ApiErrorBody, ApiErrorCode, FieldErrors } from "@/domain/errors";

function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
  fieldErrors?: FieldErrors,
): Response {
  const body: ApiErrorBody = {
    error: fieldErrors ? { code, message, fieldErrors } : { code, message },
  };

  return Response.json(body, { status });
}

export function unauthorized(): Response {
  return errorResponse("unauthorized", "Потрібна автентифікація", 401);
}

export function notFound(): Response {
  return errorResponse("not_found", "Не знайдено", 404);
}

export function validationFailed(fieldErrors: FieldErrors): Response {
  return errorResponse(
    "validation_failed",
    "Перевірте правильність заповнення полів",
    422,
    fieldErrors,
  );
}

export function versionConflict(): Response {
  return errorResponse("version_conflict", "Дані змінили в іншому місці, оновіть сторінку", 409);
}

export function rateLimited(): Response {
  return errorResponse("rate_limited", "Забагато спроб, спробуйте пізніше", 429);
}

export function providerUnavailable(): Response {
  return errorResponse("provider_unavailable", "Сервіс тимчасово недоступний", 503);
}

export function fieldErrorsFromZodError(error: z.ZodError): FieldErrors {
  const flattened = z.flattenError(error).fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened).map(([field, messages]) => [field, (messages as string[])[0] ?? ""]),
  );
}
