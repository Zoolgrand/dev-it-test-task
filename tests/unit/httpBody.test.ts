import { describe, expect, it } from "vitest";
import { MAX_BODY_BYTES, parseJsonBody } from "@/server/http/body";

function postRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/test", { method: "POST", body, headers });
}

describe("request body parsing", () => {
  it("returns the decoded value for a well-formed JSON body", async () => {
    const request = postRequest(JSON.stringify({ email: "admin@example.com" }));

    expect(await parseJsonBody(request)).toEqual({
      status: "ok",
      value: { email: "admin@example.com" },
    });
  });

  it("reports malformed JSON instead of throwing", async () => {
    const request = postRequest("{ not json");

    expect(await parseJsonBody(request)).toEqual({ status: "malformed" });
  });

  it("reports an empty body as malformed rather than as valid input", async () => {
    const request = postRequest("");

    expect(await parseJsonBody(request)).toEqual({ status: "malformed" });
  });

  it("refuses a body whose declared length exceeds the limit", async () => {
    const request = postRequest("{}", { "content-length": String(MAX_BODY_BYTES + 1) });

    expect(await parseJsonBody(request)).toEqual({ status: "too_large" });
  });

  it("refuses an oversized body that declares no length", async () => {
    const oversized = JSON.stringify({ description: "x".repeat(MAX_BODY_BYTES) });
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: oversized,
      duplex: "half",
    } as RequestInit);
    request.headers.delete("content-length");

    expect(await parseJsonBody(request)).toEqual({ status: "too_large" });
  });

  it("decodes multi-byte characters that straddle a chunk boundary", async () => {
    const request = postRequest(JSON.stringify({ name: "Ноутбук Ø 15″" }));

    expect(await parseJsonBody(request)).toEqual({
      status: "ok",
      value: { name: "Ноутбук Ø 15″" },
    });
  });
});
