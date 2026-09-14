import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";

describe("database connection", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("runs against the test database, never the development one", async () => {
    const [{ current_database }] = await prisma.$queryRaw<
      Array<{ current_database: string }>
    >`SELECT current_database()`;

    expect(current_database).toBe("product_studio_test");
  });
});
