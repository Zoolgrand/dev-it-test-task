import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";

describe("database connection", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects to a real PostgreSQL instance", async () => {
    const rows = await prisma.$queryRaw<Array<{ one: number }>>`SELECT 1 AS one`;

    expect(rows[0].one).toBe(1);
  });

  it("runs against the test database, never the development one", async () => {
    const [{ current_database }] = await prisma.$queryRaw<
      Array<{ current_database: string }>
    >`SELECT current_database()`;

    expect(current_database).toBe("product_studio_test");
  });
});
