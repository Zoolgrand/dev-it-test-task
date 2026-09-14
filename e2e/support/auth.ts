import type { APIRequestContext, Page } from "@playwright/test";
import { messages } from "../../src/lib/messages";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./constants";

export const SESSION_COOKIE_NAME = "pcs_session";

export function readSessionCookie(setCookieHeader: string | undefined): string {
  if (!setCookieHeader) {
    throw new Error("Response did not set a session cookie");
  }

  const match = new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`).exec(setCookieHeader);

  if (!match) {
    throw new Error("Set-Cookie header did not contain the session cookie");
  }

  return match[1];
}

export async function logIn(request: APIRequestContext): Promise<{ cookie: string }> {
  const response = await request.post("/api/auth/login", {
    data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD },
  });

  if (!response.ok()) {
    throw new Error(`Fixture login failed with status ${response.status()}`);
  }

  const sessionId = readSessionCookie(response.headers()["set-cookie"]);

  return { cookie: `${SESSION_COOKIE_NAME}=${sessionId}` };
}

export async function logInThroughUi(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel(messages.login.email).fill(E2E_ADMIN_EMAIL);
  await page.getByLabel(messages.login.password).fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: messages.login.submit }).click();
  await page.waitForURL(/\/admin\/products/);
}
