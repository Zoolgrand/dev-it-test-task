import { expect, test } from "@playwright/test";
import { createProduct, truncateProducts } from "../support/factories";

test.beforeEach(truncateProducts);

test("the public catalogue lists published products only", async ({ request }) => {
  await createProduct({ status: "draft", name: "Чернетка" });
  await createProduct({ status: "published", name: "Опублікований" });

  const response = await request.get("/api/products");
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(JSON.stringify(body)).not.toContain("Чернетка");
});

test("the public catalogue serves a bounded page instead of the whole table", async ({
  request,
}) => {
  await createProduct({ status: "published", name: "Альфа", slug: "alfa" });
  await createProduct({ status: "published", name: "Бета", slug: "beta" });
  await createProduct({ status: "published", name: "Гамма", slug: "gamma" });

  const body = await (await request.get("/api/products?limit=2")).json();

  expect(body.products).toHaveLength(2);
  expect(body.total).toBe(3);
});

test("a caller with no page size still gets a ceiling rather than every row", async ({
  request,
}) => {
  await createProduct({ status: "published" });

  const body = await (await request.get("/api/products")).json();

  expect(body.limit).toBeGreaterThan(0);
  expect(body.limit).toBeLessThanOrEqual(100);
});

test("the caller can walk past the first page with an offset", async ({ request }) => {
  await createProduct({ status: "published", name: "Альфа", slug: "alfa" });
  await createProduct({ status: "published", name: "Бета", slug: "beta" });
  await createProduct({ status: "published", name: "Гамма", slug: "gamma" });

  const body = await (await request.get("/api/products?limit=2&offset=2")).json();

  expect(body.products).toHaveLength(1);
  expect(body.products[0].name).toBe("Гамма");
  expect(body.offset).toBe(2);
});

test("a page size above the ceiling is refused rather than quietly served", async ({ request }) => {
  const response = await request.get("/api/products?limit=5000");

  expect(response.status()).toBe(422);
  expect((await response.json()).error.fieldErrors).toHaveProperty("limit");
});

test("a page size that is not a number is refused", async ({ request }) => {
  const response = await request.get("/api/products?limit=усі");

  expect(response.status()).toBe(422);
});

test("a negative offset is refused rather than treated as zero", async ({ request }) => {
  const response = await request.get("/api/products?offset=-5");

  expect(response.status()).toBe(422);
});

test("a draft is not reachable through the public api", async ({ request }) => {
  const draft = await createProduct({ status: "draft", slug: "prykhovana-chernetka" });

  const response = await request.get(`/api/products/${draft.slug}`);

  expect(response.status()).toBe(404);
});

test("the public api answers a draft exactly as it answers a slug that does not exist", async ({
  request,
}) => {
  const draft = await createProduct({ status: "draft", slug: "prykhovana" });

  const forDraft = await request.get(`/api/products/${draft.slug}`);
  const forMissing = await request.get("/api/products/vzagali-nemaye");

  expect(forDraft.status()).toBe(forMissing.status());
  expect(await forDraft.json()).toEqual(await forMissing.json());
});

test("the public product carries no internal fields", async ({ request }) => {
  const product = await createProduct({ status: "published", slug: "vidkrytyi" });

  const body = await (await request.get(`/api/products/${product.slug}`)).json();

  expect(body.product).not.toHaveProperty("id");
  expect(body.product).not.toHaveProperty("status");
  expect(JSON.stringify(body)).not.toContain("passwordHash");
});
