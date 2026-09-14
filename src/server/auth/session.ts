import "server-only";
import { randomBytes } from "node:crypto";

export const SESSION_COOKIE_NAME = "pcs_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24;

export function generateSessionId(): string {
  return randomBytes(32).toString("base64url");
}

export function isSessionExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= expiresAt.getTime();
}

export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
  const { prisma } = await import("@/server/db");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await prisma.session.create({
    data: { id: generateSessionId(), userId, expiresAt },
  });

  return { id: session.id, expiresAt: session.expiresAt };
}

export async function findValidSession(sessionId: string): Promise<{ userId: string } | null> {
  const { prisma } = await import("@/server/db");
  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session || isSessionExpired(session.expiresAt)) {
    return null;
  }

  return { userId: session.userId };
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { prisma } = await import("@/server/db");
  await prisma.session.deleteMany({ where: { id: sessionId } });
}
