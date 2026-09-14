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
