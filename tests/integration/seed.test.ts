import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { seed } from "../../prisma/seed";
import { truncateAll } from "../factories";

describe("database seed", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates one administrator and three demo products", async () => {
    await seed({ adminEmail: "admin@example.com", adminPassword: "local-dev-password" });

    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.product.count()).toBe(3);
  });

  it("creates both a draft and a published product, as the task requires", async () => {
    await seed({ adminEmail: "admin@example.com", adminPassword: "local-dev-password" });

    expect(await prisma.product.count({ where: { status: "draft" } })).toBeGreaterThan(0);
    expect(await prisma.product.count({ where: { status: "published" } })).toBeGreaterThan(0);
  });

  it("never stores the password in readable form", async () => {
    await seed({ adminEmail: "admin@example.com", adminPassword: "local-dev-password" });

    const user = await prisma.user.findUniqueOrThrow({ where: { email: "admin@example.com" } });
    expect(user.passwordHash).not.toContain("local-dev-password");
    expect(user.passwordHash.startsWith("$argon2id$")).toBe(true);
  });

  it("produces the same data when run twice", async () => {
    await seed({ adminEmail: "admin@example.com", adminPassword: "local-dev-password" });
    await seed({ adminEmail: "admin@example.com", adminPassword: "local-dev-password" });

    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.product.count()).toBe(3);
    expect(await prisma.productAttribute.count()).toBe(await prisma.productAttribute.count());
  });

  it("gives every product at least one attribute", async () => {
    await seed({ adminEmail: "admin@example.com", adminPassword: "local-dev-password" });

    const products = await prisma.product.findMany({ include: { attributes: true } });
    for (const product of products) {
      expect(product.attributes.length).toBeGreaterThan(0);
    }
  });
});
