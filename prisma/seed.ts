import { hash } from "@node-rs/argon2";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const prisma = createPrismaClient();

const envSchema = z.object({
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(8),
});

export type SeedInput = { adminEmail: string; adminPassword: string };

type DemoProduct = {
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "published";
  attributes: Array<{ name: string; value: string }>;
};

const demoProducts: DemoProduct[] = [
  {
    slug: "termokruzhka-nerzhaviyucha-stal",
    name: "Термокружка з нержавіючої сталі",
    description:
      "Термокружка з подвійними стінками зберігає напій гарячим до восьми годин. Корпус із нержавіючої сталі не окислюється і не вбирає запахи, а прогумована кришка запобігає протіканню в сумці.",
    seoTitle: "Термокружка з нержавіючої сталі 500 мл",
    seoDescription: "Термокружка 500 мл із нержавіючої сталі, зберігає температуру до 8 годин.",
    status: "published",
    attributes: [
      { name: "Матеріал", value: "Нержавіюча сталь" },
      { name: "Обʼєм", value: "500 мл" },
      { name: "Час утримання тепла", value: "8 годин" },
    ],
  },
  {
    slug: "rukzak-miskyi-vodovidshtovhuvalnyi",
    name: "Міський рюкзак водовідштовхувальний",
    description:
      "Місткий рюкзак на 20 літрів з водовідштовхувальної тканини. Окреме відділення для ноутбука з амортизуючою підкладкою, ергономічні лямки та світловідбивні елементи для безпеки в темний час доби.",
    seoTitle: "Міський рюкзак 20 л для ноутбука",
    seoDescription: "Водовідштовхувальний міський рюкзак 20 л з відділенням для ноутбука.",
    status: "published",
    attributes: [
      { name: "Обʼєм", value: "20 л" },
      { name: "Матеріал", value: "Поліестер з водовідштовхувальним покриттям" },
      { name: "Відділення для ноутбука", value: "До 15.6 дюйма" },
    ],
  },
  {
    slug: "navushnyky-bezdrotovi-shumopodavlennia",
    name: "Бездротові навушники з шумопридушенням",
    description:
      "Накладні бездротові навушники з активним шумопридушенням і часом роботи до 30 годин на одному заряді. Швидка зарядка на 10 хвилин дає до 3 годин прослуховування.",
    seoTitle: "Бездротові навушники з активним шумопридушенням",
    seoDescription: "Навушники з активним шумопридушенням, до 30 годин роботи, швидка зарядка.",
    status: "draft",
    attributes: [
      { name: "Тип", value: "Накладні, бездротові" },
      { name: "Час роботи", value: "30 годин" },
      { name: "Шумопридушення", value: "Активне" },
    ],
  },
];

export async function seed(input: SeedInput): Promise<void> {
  const passwordHash = await hash(input.adminPassword, { algorithm: 2 });

  await prisma.user.upsert({
    where: { email: input.adminEmail },
    create: { email: input.adminEmail, passwordHash },
    update: { passwordHash },
  });

  for (const product of demoProducts) {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { slug: product.slug } });

      if (existing) {
        await tx.productAttribute.deleteMany({ where: { productId: existing.id } });
      }

      await tx.product.upsert({
        where: { slug: product.slug },
        create: {
          slug: product.slug,
          name: product.name,
          description: product.description,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          status: product.status,
          attributes: {
            create: product.attributes.map((attribute, position) => ({
              name: attribute.name,
              value: attribute.value,
              position,
            })),
          },
        },
        update: {
          name: product.name,
          description: product.description,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          status: product.status,
          attributes: {
            create: product.attributes.map((attribute, position) => ({
              name: attribute.name,
              value: attribute.value,
              position,
            })),
          },
        },
      });
    });
  }
}

async function main(): Promise<void> {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running db:seed");
    process.exit(1);
  }

  await seed({ adminEmail: parsed.data.ADMIN_EMAIL, adminPassword: parsed.data.ADMIN_PASSWORD });
}

if (process.argv[1]?.endsWith("seed.ts")) {
  void main();
}
