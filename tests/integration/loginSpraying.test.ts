import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { EMAIL_ATTEMPT_LIMIT, IP_ATTEMPT_LIMIT, login } from "@/server/auth/service";
import { createAdmin, truncateAll } from "../factories";

const ATTACKER = "203.0.113.7";
const VICTIM = "198.51.100.4";

describe("login throttling across accounts and addresses", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("stops password spraying, where each account is tried only once from one address", async () => {
    for (let attempt = 0; attempt < IP_ATTEMPT_LIMIT; attempt += 1) {
      const outcome = await login({
        email: `victim-${attempt}@example.com`,
        password: "guess",
        ip: ATTACKER,
      });
      expect(outcome.status).toBe("invalid_credentials");
    }

    const next = await login({
      email: "victim-fresh@example.com",
      password: "guess",
      ip: ATTACKER,
    });

    expect(next.status).toBe("rate_limited");
  });

  it("lets the real owner in from their own address while an attacker is locked out", async () => {
    const admin = await createAdmin();

    for (let attempt = 0; attempt < IP_ATTEMPT_LIMIT; attempt += 1) {
      await login({ email: `victim-${attempt}@example.com`, password: "guess", ip: ATTACKER });
    }

    expect((await login({ email: admin.email, password: "guess", ip: ATTACKER })).status).toBe(
      "rate_limited",
    );
    expect((await login({ email: admin.email, password: admin.password, ip: VICTIM })).status).toBe(
      "ok",
    );
  });

  it("keeps blocking a sprayed account after the attacker moves to a new address", async () => {
    const admin = await createAdmin();

    for (let attempt = 0; attempt < EMAIL_ATTEMPT_LIMIT; attempt += 1) {
      await login({ email: admin.email, password: "guess", ip: `203.0.113.${attempt}` });
    }

    const fromNewAddress = await login({
      email: admin.email,
      password: "guess",
      ip: "203.0.113.200",
    });

    expect(fromNewAddress.status).toBe("rate_limited");
  });

  it("never locks every visitor out because the client address could not be identified", async () => {
    const admin = await createAdmin();

    for (let attempt = 0; attempt < IP_ATTEMPT_LIMIT + 1; attempt += 1) {
      const outcome = await login({
        email: `victim-${attempt}@example.com`,
        password: "guess",
        ip: null,
      });
      expect(outcome.status).toBe("invalid_credentials");
    }

    expect((await login({ email: admin.email, password: admin.password, ip: null })).status).toBe(
      "ok",
    );
  });

  it("keeps the account budget even when the client address is unknown", async () => {
    const admin = await createAdmin();

    for (let attempt = 0; attempt < EMAIL_ATTEMPT_LIMIT; attempt += 1) {
      await login({ email: admin.email, password: "guess", ip: null });
    }

    expect((await login({ email: admin.email, password: "guess", ip: null })).status).toBe(
      "rate_limited",
    );
  });

  it("clears the account budget on success but keeps the address under its own budget", async () => {
    const admin = await createAdmin();
    await login({ email: admin.email, password: "guess", ip: ATTACKER });

    expect(
      (await login({ email: admin.email, password: admin.password, ip: ATTACKER })).status,
    ).toBe("ok");
    expect(await prisma.attemptCounter.count({ where: { key: `email:${admin.email}` } })).toBe(0);
    expect(await prisma.attemptCounter.count({ where: { key: `ip:${ATTACKER}` } })).toBe(1);
  });
});
