import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { hash } from "@node-rs/argon2";
import { config } from "dotenv";
import { db } from "./db";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./constants";

function resolvePrismaCli(): string {
  return resolve(process.cwd(), "node_modules", "prisma", "build", "index.js");
}

export default async function setup(): Promise<void> {
  const { parsed } = config({ path: ".env.e2e" });
  const databaseUrl = parsed?.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(".env.e2e does not define DATABASE_URL");
  }

  if (!databaseUrl.includes("product_studio_e2e")) {
    throw new Error(`Expected the e2e database product_studio_e2e, received: ${databaseUrl}`);
  }

  execFileSync(process.execPath, [resolvePrismaCli(), "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  await db.$executeRawUnsafe(
    `TRUNCATE TABLE "ProductAttribute", "Product", "Session", "User" RESTART IDENTITY CASCADE`,
  );

  await db.user.create({
    data: {
      email: E2E_ADMIN_EMAIL,
      passwordHash: await hash(E2E_ADMIN_PASSWORD, { algorithm: 2 }),
    },
  });

  await db.$disconnect();
}

if (process.argv[1]?.endsWith("global-setup.ts")) {
  void setup();
}
