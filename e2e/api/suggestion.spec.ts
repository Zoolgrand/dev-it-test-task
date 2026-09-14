import { expect, test } from "@playwright/test";
import { logIn } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";

test.beforeEach(truncateProducts);

test("a suggestion request without a session is refused", async ({ request }) => {
  const product = await createProduct();

  const response = await request.post(`/api/admin/products/${product.id}/suggestion`);

  expect(response.status()).toBe(401);
});

test("a suggestion request for a product that does not exist is refused with a not found", async ({
  request,
}) => {
  const auth = await logIn(request);

  const response = await request.post("/api/admin/products/missing/suggestion", {
    headers: { cookie: auth.cookie },
  });

  expect(response.status()).toBe(404);
});

test("an authenticated request returns a mock suggestion built from the product", async ({
  request,
}) => {
  const auth = await logIn(request);
  const product = await createProduct({ name: "Термокухоль" });

  const response = await request.post(`/api/admin/products/${product.id}/suggestion`, {
    headers: { cookie: auth.cookie },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.mode).toBe("mock");
  expect(body.suggestion.description).toContain("Термокухоль");
  expect(body.suggestion.seoTitle.length).toBeGreaterThan(0);
  expect(body.suggestion.seoDescription.length).toBeGreaterThan(0);
});
