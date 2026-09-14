import { cookies } from "next/headers";
import { loginSchema } from "@/domain/auth/schema";
import { login } from "@/server/auth/service";
import { SESSION_COOKIE_NAME } from "@/server/auth/session";
import {
  fieldErrorsFromZodError,
  rateLimited,
  unauthorized,
  validationFailed,
} from "@/server/http/responses";

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return validationFailed(fieldErrorsFromZodError(parsed.error));
  }

  const outcome = await login(parsed.data);

  if (outcome.status === "rate_limited") {
    return rateLimited();
  }

  if (outcome.status === "invalid_credentials") {
    return unauthorized();
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, outcome.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: outcome.expiresAt,
  });

  return Response.json({ ok: true });
}
