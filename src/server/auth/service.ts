import "server-only";
import { prisma } from "@/server/db";
import { consumeDummyVerification, verifyPassword } from "./password";
import { createRateLimiter } from "./rate-limit";
import { createSession, deleteSession } from "./session";

const loginRateLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

export type LoginOutcome =
  | { status: "ok"; sessionId: string; expiresAt: Date }
  | { status: "invalid_credentials" }
  | { status: "rate_limited" };

export async function login(input: { email: string; password: string }): Promise<LoginOutcome> {
  if (!loginRateLimiter.isAllowed(input.email)) {
    return { status: "rate_limited" };
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    await consumeDummyVerification(input.password);
    loginRateLimiter.recordFailure(input.email);
    return { status: "invalid_credentials" };
  }

  const isValid = await verifyPassword(user.passwordHash, input.password);

  if (!isValid) {
    loginRateLimiter.recordFailure(input.email);
    return { status: "invalid_credentials" };
  }

  loginRateLimiter.reset(input.email);
  const session = await createSession(user.id);

  return { status: "ok", sessionId: session.id, expiresAt: session.expiresAt };
}

export async function logout(sessionId: string): Promise<void> {
  await deleteSession(sessionId);
}
