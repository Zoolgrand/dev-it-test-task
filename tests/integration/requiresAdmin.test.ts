import { createHash } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { findAdminBySession } from "@/server/auth/session";
import { SESSION_TTL_MS } from "@/server/auth/session";
import { createAdmin, truncateAll } from "../factories";

function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

describe("resolving the signed-in admin", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns the account behind a valid session", async () => {
    const admin = await createAdmin();
    await prisma.session.create({
      data: {
        tokenHash: digest("live"),
        userId: admin.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });

    expect(await findAdminBySession("live")).toEqual({ id: admin.id, email: admin.email });
  });

  it("refuses an expired session even though the row still exists", async () => {
    const admin = await createAdmin();
    await prisma.session.create({
      data: {
        tokenHash: digest("stale"),
        userId: admin.id,
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    expect(await findAdminBySession("stale")).toBeNull();
  });

  it("refuses a session token that was never issued", async () => {
    expect(await findAdminBySession("never-issued")).toBeNull();
  });

  it("refuses a session whose account has been deleted", async () => {
    const admin = await createAdmin();
    await prisma.session.create({
      data: {
        tokenHash: digest("orphan"),
        userId: admin.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
    await prisma.user.delete({ where: { id: admin.id } });

    expect(await findAdminBySession("orphan")).toBeNull();
  });
});
