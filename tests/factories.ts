import { prisma } from "@/server/db";

export async function truncateAll(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "ProductAttribute", "Product", "Session", "User" RESTART IDENTITY CASCADE`,
  );
}
