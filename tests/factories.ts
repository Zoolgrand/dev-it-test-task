import { randomUUID } from "node:crypto";
import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";

export async function truncateAll(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "ProductAttribute", "Product", "Session", "User" RESTART IDENTITY CASCADE`,
  );
}

export async function createAdmin(
  overrides: { email?: string; password?: string } = {},
): Promise<{ id: string; email: string; password: string }> {
  const email = overrides.email ?? `admin-${randomUUID()}@example.com`;
  const password = overrides.password ?? "factory-password";
  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });

  return { id: user.id, email, password };
}
