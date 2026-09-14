import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";

describe("password hashing", () => {
  it("never stores the password in readable form", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");

    expect(passwordHash).not.toContain("correct horse battery staple");
    expect(passwordHash.startsWith("$argon2id$")).toBe(true);
  });

  it("produces a different hash for the same password every time", async () => {
    const first = await hashPassword("same password");
    const second = await hashPassword("same password");

    expect(first).not.toBe(second);
  });

  it("accepts the correct password", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");

    expect(await verifyPassword(passwordHash, "correct horse battery staple")).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");

    expect(await verifyPassword(passwordHash, "wrong password")).toBe(false);
  });

  it("rejects a malformed hash without throwing", async () => {
    expect(await verifyPassword("not-a-hash", "anything")).toBe(false);
  });
});
