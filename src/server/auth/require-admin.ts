import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import { findValidSession, SESSION_COOKIE_NAME } from "./session";

export type AdminUser = { id: string; email: string };

export async function requireAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const session = await findValidSession(sessionId);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });

  if (!user) {
    return null;
  }

  return { id: user.id, email: user.email };
}
