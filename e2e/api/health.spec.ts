import { expect, test } from "@playwright/test";

test("GET /api/health returns 200 with a JSON body", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  await expect(response.json()).resolves.toEqual({ ok: true });
});
