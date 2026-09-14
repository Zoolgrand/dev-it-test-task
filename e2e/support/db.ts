import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client";

const { parsed } = config({ path: ".env.e2e" });
const connectionString = parsed?.DATABASE_URL;

if (!connectionString || !connectionString.includes("product_studio_e2e")) {
  throw new Error("Expected the e2e database product_studio_e2e in .env.e2e");
}

export const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
