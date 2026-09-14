import { expect, test } from "@playwright/test";
import { logIn } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";

const JSON_HEADERS = { "content-type": "application/json" };

const MALFORMED = Buffer.from("{ this is not json", "utf8");

test.beforeEach(truncateProducts);

test("login answers malformed JSON with a client error, not a server error", async ({
  request,
}) => {
  const response = await request.post("/api/auth/login", {
    data: MALFORMED,
    headers: JSON_HEADERS,
  });

  expect(response.status()).toBe(400);
  expect((await response.json()).error.code).toBe("malformed_body");
});

test("a product write answers malformed JSON with a client error and changes nothing", async ({
  request,
}) => {
  const auth = await logIn(request);
  const product = await createProduct({ description: "Старий опис" });

  const response = await request.patch(`/api/admin/products/${product.id}`, {
    data: MALFORMED,
    headers: { ...JSON_HEADERS, cookie: auth.cookie },
  });

  expect(response.status()).toBe(400);
  expect((await response.json()).error.code).toBe("malformed_body");
});

test("an oversized body is refused before it is validated", async ({ request }) => {
  const auth = await logIn(request);
  const product = await createProduct();

  const response = await request.patch(`/api/admin/products/${product.id}`, {
    data: Buffer.from(JSON.stringify({ description: "x".repeat(70_000) }), "utf8"),
    headers: { ...JSON_HEADERS, cookie: auth.cookie },
  });

  expect(response.status()).toBe(413);
  expect((await response.json()).error.code).toBe("payload_too_large");
});

test("an unauthenticated write is refused before its body is even read", async ({ request }) => {
  const product = await createProduct({ description: "Старий опис" });

  const response = await request.patch(`/api/admin/products/${product.id}`, {
    data: MALFORMED,
    headers: JSON_HEADERS,
  });

  expect(response.status()).toBe(401);
});
