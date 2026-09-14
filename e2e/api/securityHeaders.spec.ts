import { expect, test } from "@playwright/test";

test("every response refuses to be framed by another site", async ({ request }) => {
  const response = await request.get("/");

  expect(response.headers()["x-frame-options"]).toBe("DENY");
});

test("browsers are told not to sniff a content type we did not declare", async ({ request }) => {
  const response = await request.get("/");

  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});

test("the full url is never leaked to another origin through the referer", async ({ request }) => {
  const response = await request.get("/");

  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

test("a content security policy is present and forbids framing", async ({ request }) => {
  const response = await request.get("/");
  const policy = response.headers()["content-security-policy"];

  expect(policy).toBeTruthy();
  expect(policy).toContain("frame-ancestors 'none'");
  expect(policy).toContain("object-src 'none'");
});

test("the api answers with the same protective headers as the pages", async ({ request }) => {
  const response = await request.get("/api/products");

  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});

test("the server does not advertise the framework it runs on", async ({ request }) => {
  const response = await request.get("/");

  expect(response.headers()["x-powered-by"]).toBeUndefined();
});

test("browsers are told the site needs no camera, microphone or location", async ({ request }) => {
  const response = await request.get("/");
  const policy = response.headers()["permissions-policy"];

  expect(policy).toContain("camera=()");
  expect(policy).toContain("microphone=()");
  expect(policy).toContain("geolocation=()");
});

test("an admin page is never written to a shared cache", async ({ request }) => {
  const response = await request.get("/admin/login");

  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("an admin api answer is never written to a shared cache", async ({ request }) => {
  const response = await request.get("/api/admin/products");

  expect(response.headers()["cache-control"]).toContain("no-store");
});

function scriptDirective(policy: string | undefined): string {
  const found = policy?.split("; ").find((part) => part.startsWith("script-src "));

  if (!found) {
    throw new Error(`Response carried no script-src directive: ${policy}`);
  }

  return found;
}

test("an admin page admits inline scripts only by nonce", async ({ request }) => {
  const response = await request.get("/admin/login");
  const directive = scriptDirective(response.headers()["content-security-policy"]);

  expect(directive).toMatch(/'nonce-[^']+'/);
  expect(directive).not.toContain("'unsafe-inline'");
});

test("two visits to an admin page never share a nonce", async ({ request }) => {
  const first = await request.get("/admin/login");
  const second = await request.get("/admin/login");

  const read = (response: typeof first): string => {
    const match = /'nonce-([^']+)'/.exec(
      scriptDirective(response.headers()["content-security-policy"]),
    );
    if (!match) throw new Error("Response carried no nonce");
    return match[1];
  };

  expect(read(first)).not.toBe(read(second));
});

test("the scripts an admin page serves carry the nonce its header announces", async ({
  request,
}) => {
  const response = await request.get("/admin/login");
  const match = /'nonce-([^']+)'/.exec(
    scriptDirective(response.headers()["content-security-policy"]),
  );
  if (!match) throw new Error("Response carried no nonce");

  expect(await response.text()).toContain(`nonce="${match[1]}"`);
});

test("a public page keeps a policy it can be prerendered with", async ({ request }) => {
  const response = await request.get("/");

  expect(scriptDirective(response.headers()["content-security-policy"])).not.toContain("nonce-");
});
