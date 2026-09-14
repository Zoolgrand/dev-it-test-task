import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/domain/auth/cookie";
import { loginSchema } from "@/domain/auth/schema";
import { firstFieldErrors } from "@/domain/fieldErrors";
import { login } from "@/server/auth/service";
import { bodyErrorResponse, parseJsonBody } from "@/server/http/body";
import { readClientIp } from "@/server/http/clientIp";
import { rateLimited, unauthorized, validationFailed } from "@/server/http/responses";

export async function POST(request: Request): Promise<Response> {
  const body = await parseJsonBody(request);

  if (body.status !== "ok") {
    return bodyErrorResponse(body);
  }

  const parsed = loginSchema.safeParse(body.value);

  if (!parsed.success) {
    return validationFailed(firstFieldErrors(parsed.error));
  }

  const outcome = await login({ ...parsed.data, ip: readClientIp(request) });

  if (outcome.status === "rate_limited") {
    return rateLimited();
  }

  if (outcome.status === "invalid_credentials") {
    return unauthorized();
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, outcome.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: outcome.expiresAt,
  });

  return Response.json({ ok: true });
}
