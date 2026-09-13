import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";

function resolvePrismaCli(): string {
  const require = createRequire(import.meta.url);
  const packageJsonPath = require.resolve("prisma/package.json");
  const { bin } = require("prisma/package.json") as { bin: Record<string, string> };

  return resolve(dirname(packageJsonPath), bin.prisma);
}

export default function setup() {
  const { parsed } = config({ path: ".env.test", override: true });
  const databaseUrl = parsed?.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(".env.test does not define DATABASE_URL");
  }

  if (!databaseUrl.includes("product_studio_test")) {
    throw new Error(`Expected the test database product_studio_test, received: ${databaseUrl}`);
  }

  execFileSync(process.execPath, [resolvePrismaCli(), "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
