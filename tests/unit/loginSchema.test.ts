import { describe, expect, it } from "vitest";
import { loginSchema } from "@/domain/auth/schema";
import { PASSWORD_MAX_LENGTH } from "@/domain/auth/limits";

const EMAIL = "admin@example.com";

describe("login credentials", () => {
  it("refuses an empty password", () => {
    expect(loginSchema.safeParse({ email: EMAIL, password: "" }).success).toBe(false);
  });

  it("accepts a password exactly at the accepted maximum", () => {
    const password = "a".repeat(PASSWORD_MAX_LENGTH);

    expect(loginSchema.safeParse({ email: EMAIL, password }).success).toBe(true);
  });

  it("refuses a password one character over the maximum, so hashing cost stays bounded", () => {
    const password = "a".repeat(PASSWORD_MAX_LENGTH + 1);

    expect(loginSchema.safeParse({ email: EMAIL, password }).success).toBe(false);
  });

  it("names the password field when the password is too long", () => {
    const password = "a".repeat(PASSWORD_MAX_LENGTH + 1);
    const parsed = loginSchema.safeParse({ email: EMAIL, password });

    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error("expected a failure");
    expect(parsed.error.issues[0].path).toEqual(["password"]);
  });
});
