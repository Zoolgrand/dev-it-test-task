import { ApiError } from "@google/genai";
import { describe, expect, it } from "vitest";
import { isRateLimitError } from "@/server/llm/gemini";

describe("gemini rate limit classification", () => {
  it("recognises a 429 quota error from the Gemini API", () => {
    const error = new ApiError({ message: "quota exceeded", status: 429 });

    expect(isRateLimitError(error)).toBe(true);
  });

  it("does not treat a 500 server error as a rate limit", () => {
    const error = new ApiError({ message: "internal error", status: 500 });

    expect(isRateLimitError(error)).toBe(false);
  });

  it("does not treat a generic network error as a rate limit", () => {
    expect(isRateLimitError(new Error("network down"))).toBe(false);
  });

  it("does not throw on a non-error value", () => {
    expect(isRateLimitError("not an error")).toBe(false);
  });
});
