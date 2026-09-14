import { expect, test } from "@playwright/test";
import { db } from "../support/db";
import { readSessionCookie } from "../support/auth";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "../support/constants";

test("logout removes the session so the cookie can never be replayed", async ({ request }) => {
  const login = await request.post("/api/auth/login", {
    data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD },
  });
  expect(login.status()).toBe(200);
  const sessionId = readSessionCookie(login.headers()["set-cookie"]);

  await request.post("/api/auth/logout", {
    headers: { cookie: `pcs_session=${sessionId}` },
  });

  expect(await db.session.findUnique({ where: { id: sessionId } })).toBeNull();
});

test("login rejects a wrong password without revealing whether the email exists", async ({
  request,
}) => {
  const unknown = await request.post("/api/auth/login", {
    data: { email: "nobody@example.com", password: "whatever" },
  });
  const known = await request.post("/api/auth/login", {
    data: { email: E2E_ADMIN_EMAIL, password: "whatever" },
  });

  expect(unknown.status()).toBe(401);
  expect(known.status()).toBe(401);
  expect(await unknown.json()).toEqual(await known.json());
});

test("login rejects a malformed body with per-field errors", async ({ request }) => {
  const response = await request.post("/api/auth/login", { data: { email: "not-an-email" } });

  expect(response.status()).toBe(422);
  const body = await response.json();
  expect(Object.keys(body.error.fieldErrors)).toEqual(
    expect.arrayContaining(["email", "password"]),
  );
});

test("the session cookie is not readable from JavaScript", async ({ request }) => {
  const response = await request.post("/api/auth/login", {
    data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD },
  });

  const cookie = response.headers()["set-cookie"];
  expect(cookie).toContain("HttpOnly");
  expect(cookie).toMatch(/SameSite=Lax/i);
});

test("the admin product list refuses an unauthenticated request", async ({ request }) => {
  const response = await request.get("/api/admin/products");

  expect(response.status()).toBe(401);
  expect((await response.json()).error.code).toBe("unauthorized");
});

test("a direct API call bypasses the proxy redirect and is still refused", async ({ request }) => {
  const response = await request.get("/api/admin/products", {
    headers: { cookie: "pcs_session=forged" },
  });

  expect(response.status()).toBe(401);
});
