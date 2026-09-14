import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/server/db";

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24;

export type AdminUser = { id: string; email: string };

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isSessionExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= expiresAt.getTime();
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const session = await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });

  return { token, expiresAt: session.expiresAt };
}

export async function findAdminBySession(token: string): Promise<AdminUser | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: { expiresAt: true, user: { select: { id: true, email: true } } },
  });

  if (!session || isSessionExpired(session.expiresAt)) {
    return null;
  }

  return { id: session.user.id, email: session.user.email };
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}

export async function deleteExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } });

  return result.count;
}
