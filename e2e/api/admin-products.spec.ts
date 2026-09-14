import { expect, test } from "@playwright/test";
import { SEO_TITLE_MAX_LENGTH } from "../../src/domain/product/limits";
import { db } from "../support/db";
import { logIn } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";

test.beforeEach(truncateProducts);

test("a write without a session is refused and changes nothing", async ({ request }) => {
  const product = await createProduct({ description: "Старий опис" });

  const response = await request.patch(`/api/admin/products/${product.id}`, {
    data: {
      description: "Новий опис",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
      status: "published",
      expectedUpdatedAt: product.updatedAt.toISOString(),
    },
  });

  expect(response.status()).toBe(401);
  const stored = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  expect(stored.description).toBe("Старий опис");
});

test("an seo title one character over the limit is refused with a field error and changes nothing", async ({
  request,
}) => {
  const auth = await logIn(request);
  const product = await createProduct({ seoTitle: "Початковий заголовок" });

  const response = await request.patch(`/api/admin/products/${product.id}`, {
    data: {
      description: "Опис",
      seoTitle: "я".repeat(SEO_TITLE_MAX_LENGTH + 1),
      seoDescription: "Опис",
      status: "published",
      expectedUpdatedAt: product.updatedAt.toISOString(),
    },
    headers: { cookie: auth.cookie },
  });

  expect(response.status()).toBe(422);
  const body = await response.json();
  expect(body.error.fieldErrors.seoTitle).toBeTruthy();
  const stored = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  expect(stored.seoTitle).toBe("Початковий заголовок");
});

test("a whitespace-only description is refused, because trimming happens before the length check", async ({
  request,
}) => {
  const auth = await logIn(request);
  const product = await createProduct({ description: "Початковий опис" });

  const response = await request.patch(`/api/admin/products/${product.id}`, {
    data: {
      description: "     ",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
      status: "published",
      expectedUpdatedAt: product.updatedAt.toISOString(),
    },
    headers: { cookie: auth.cookie },
  });

  expect(response.status()).toBe(422);
  const stored = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  expect(stored.description).toBe("Початковий опис");
});

test("a write based on a stale version is refused with a conflict", async ({ request }) => {
  const auth = await logIn(request);
  const product = await createProduct();
  const stale = product.updatedAt.toISOString();
  const payload = {
    description: "Опис",
    seoTitle: "Заголовок",
    seoDescription: "Опис",
    status: "draft" as const,
    expectedUpdatedAt: stale,
  };
  await request.patch(`/api/admin/products/${product.id}`, {
    data: payload,
    headers: { cookie: auth.cookie },
  });

  const second = await request.patch(`/api/admin/products/${product.id}`, {
    data: payload,
    headers: { cookie: auth.cookie },
  });

  expect(second.status()).toBe(409);
});

test("a write to a product that does not exist is refused with a not found", async ({
  request,
}) => {
  const auth = await logIn(request);

  const response = await request.patch("/api/admin/products/missing", {
    data: {
      description: "Опис",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
      status: "draft",
      expectedUpdatedAt: new Date().toISOString(),
    },
    headers: { cookie: auth.cookie },
  });

  expect(response.status()).toBe(404);
});
