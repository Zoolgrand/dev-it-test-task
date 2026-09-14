import { createHash } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { findAdminBySession } from "@/server/auth/session";
import { login, logout } from "@/server/auth/service";
import { createAdmin, truncateAll } from "../factories";

const IP = "203.0.113.1";

function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

describe("login and logout", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a session row on a successful login", async () => {
    const admin = await createAdmin();

    const outcome = await login({ email: admin.email, password: admin.password, ip: IP });

    expect(outcome.status).toBe("ok");
    expect(await prisma.session.count({ where: { userId: admin.id } })).toBe(1);
  });

  it("stores no value a database reader could replay as a session cookie", async () => {
    const admin = await createAdmin();

    const outcome = await login({ email: admin.email, password: admin.password, ip: IP });
    if (outcome.status !== "ok") throw new Error("login failed");
    const stored = await prisma.session.findFirstOrThrow({ where: { userId: admin.id } });

    expect(stored.tokenHash).not.toBe(outcome.token);
    expect(stored.tokenHash).toBe(digest(outcome.token));
  });

  it("accepts the token it handed out", async () => {
    const admin = await createAdmin();

    const outcome = await login({ email: admin.email, password: admin.password, ip: IP });
    if (outcome.status !== "ok") throw new Error("login failed");

    expect(await findAdminBySession(outcome.token)).toEqual({ id: admin.id, email: admin.email });
  });

  it("refuses the stored digest offered as if it were the token", async () => {
    const admin = await createAdmin();

    const outcome = await login({ email: admin.email, password: admin.password, ip: IP });
    if (outcome.status !== "ok") throw new Error("login failed");

    expect(await findAdminBySession(digest(outcome.token))).toBeNull();
  });

  it("creates no session when the password is wrong", async () => {
    const admin = await createAdmin();

    const outcome = await login({ email: admin.email, password: "wrong", ip: IP });

    expect(outcome.status).toBe("invalid_credentials");
    expect(await prisma.session.count()).toBe(0);
  });

  it("answers an unknown email exactly as it answers a wrong password", async () => {
    const outcome = await login({ email: "nobody@example.com", password: "wrong", ip: IP });

    expect(outcome.status).toBe("invalid_credentials");
  });

  it("removes the session row on logout", async () => {
    const admin = await createAdmin();
    const outcome = await login({ email: admin.email, password: admin.password, ip: IP });
    if (outcome.status !== "ok") throw new Error("login failed");

    await logout(outcome.token);

    expect(await prisma.session.count()).toBe(0);
  });

  it("refuses an expired session", async () => {
    const admin = await createAdmin();
    await prisma.session.create({
      data: {
        tokenHash: digest("expired-session"),
        userId: admin.id,
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    expect(await findAdminBySession("expired-session")).toBeNull();
  });

  it("refuses a session token that was never issued", async () => {
    expect(await findAdminBySession("never-issued")).toBeNull();
  });
});
