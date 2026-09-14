import "server-only";
import { prisma } from "@/server/db";
import { consumeDummyVerification, verifyPassword } from "./password";
import { createAttemptThrottle } from "@/server/throttle";
import { createSession, deleteSession, deleteExpiredSessions } from "./session";

export const EMAIL_ATTEMPT_LIMIT = 5;
export const IP_ATTEMPT_LIMIT = 20;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

const emailThrottle = createAttemptThrottle({
  scope: "email",
  limit: EMAIL_ATTEMPT_LIMIT,
  windowMs: ATTEMPT_WINDOW_MS,
});

const ipThrottle = createAttemptThrottle({
  scope: "ip",
  limit: IP_ATTEMPT_LIMIT,
  windowMs: ATTEMPT_WINDOW_MS,
});

export type LoginInput = { email: string; password: string; ip: string | null };

export type LoginOutcome =
  | { status: "ok"; token: string; expiresAt: Date }
  | { status: "invalid_credentials" }
  | { status: "rate_limited" };

async function recordFailure(input: LoginInput): Promise<void> {
  await Promise.all([
    emailThrottle.recordAttempt(input.email),
    input.ip === null ? Promise.resolve() : ipThrottle.recordAttempt(input.ip),
  ]);
}

export async function login(input: LoginInput): Promise<LoginOutcome> {
  const [emailAllowed, ipAllowed] = await Promise.all([
    emailThrottle.isAllowed(input.email),
    input.ip === null ? Promise.resolve(true) : ipThrottle.isAllowed(input.ip),
  ]);

  if (!emailAllowed || !ipAllowed) {
    return { status: "rate_limited" };
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    await consumeDummyVerification(input.password);
    await recordFailure(input);
    return { status: "invalid_credentials" };
  }

  if (!(await verifyPassword(user.passwordHash, input.password))) {
    await recordFailure(input);
    return { status: "invalid_credentials" };
  }

  await emailThrottle.reset(input.email);
  const session = await createSession(user.id);
  await Promise.all([emailThrottle.sweepExpired(), deleteExpiredSessions()]);

  return { status: "ok", token: session.token, expiresAt: session.expiresAt };
}

export async function logout(token: string): Promise<void> {
  await deleteSession(token);
}
