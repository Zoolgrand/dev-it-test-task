import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { findValidSession } from "@/server/auth/session";
import { login, logout } from "@/server/auth/service";
import { createAdmin, truncateAll } from "../factories";

describe("login and logout", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a session row on a successful login", async () => {
    const admin = await createAdmin();

    const outcome = await login({ email: admin.email, password: admin.password });

    expect(outcome.status).toBe("ok");
    expect(await prisma.session.count({ where: { userId: admin.id } })).toBe(1);
  });

  it("creates no session when the password is wrong", async () => {
    const admin = await createAdmin();

    const outcome = await login({ email: admin.email, password: "wrong" });

    expect(outcome.status).toBe("invalid_credentials");
    expect(await prisma.session.count()).toBe(0);
  });

  it("answers an unknown email exactly as it answers a wrong password", async () => {
    const outcome = await login({ email: "nobody@example.com", password: "wrong" });

    expect(outcome.status).toBe("invalid_credentials");
  });

  it("removes the session row on logout", async () => {
    const admin = await createAdmin();
    const outcome = await login({ email: admin.email, password: admin.password });
    if (outcome.status !== "ok") throw new Error("login failed");

    await logout(outcome.sessionId);

    expect(await prisma.session.count()).toBe(0);
  });

  it("refuses an expired session", async () => {
    const admin = await createAdmin();
    await prisma.session.create({
      data: { id: "expired-session", userId: admin.id, expiresAt: new Date(Date.now() - 1000) },
    });

    expect(await findValidSession("expired-session")).toBeNull();
  });

  it("refuses a session id that was never issued", async () => {
    expect(await findValidSession("never-issued")).toBeNull();
  });
});
