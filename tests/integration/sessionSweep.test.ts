import { createHash } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { deleteExpiredSessions } from "@/server/auth/session";
import { login } from "@/server/auth/service";
import { createAdmin, truncateAll } from "../factories";

function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

describe("expired session cleanup", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("removes sessions whose expiry has passed and keeps the ones still valid", async () => {
    const admin = await createAdmin();
    await prisma.session.createMany({
      data: [
        {
          tokenHash: digest("expired"),
          userId: admin.id,
          expiresAt: new Date(Date.now() - 1000),
        },
        { tokenHash: digest("valid"), userId: admin.id, expiresAt: new Date(Date.now() + 60_000) },
      ],
    });

    const removed = await deleteExpiredSessions();

    expect(removed).toBe(1);
    expect(
      await prisma.session.findUnique({ where: { tokenHash: digest("valid") } }),
    ).not.toBeNull();
    expect(await prisma.session.findUnique({ where: { tokenHash: digest("expired") } })).toBeNull();
  });

  it("clears stale sessions as a side effect of a successful login", async () => {
    const admin = await createAdmin();
    await prisma.session.create({
      data: {
        tokenHash: digest("expired"),
        userId: admin.id,
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    await login({ email: admin.email, password: admin.password, ip: "203.0.113.1" });

    expect(await prisma.session.findUnique({ where: { tokenHash: digest("expired") } })).toBeNull();
  });
});
