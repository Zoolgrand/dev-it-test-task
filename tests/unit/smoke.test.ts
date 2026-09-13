import { describe, expect, it } from "vitest";
import { LAYER } from "@/domain/layer";

describe("unit test setup", () => {
  it("resolves the @/ path alias and executes TypeScript", () => {
    expect(LAYER).toBe("domain");
  });
});
