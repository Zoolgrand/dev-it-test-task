import { describe, expect, it } from "vitest";
import { buildHref } from "@/lib/href";

describe("search parameter links", () => {
  it("drops the query string entirely when no parameter survives", () => {
    expect(
      buildHref("/admin/products", new URLSearchParams("status=draft"), { status: null }),
    ).toBe("/admin/products");
  });

  it("keeps the parameters the caller did not touch", () => {
    const href = buildHref("/", new URLSearchParams("q=ноутбук&sort=rating"), { category: "Тип" });

    expect(new URLSearchParams(href.split("?")[1]).get("q")).toBe("ноутбук");
    expect(new URLSearchParams(href.split("?")[1]).get("sort")).toBe("rating");
  });

  it("replaces a parameter rather than appending a second copy of it", () => {
    const href = buildHref("/", new URLSearchParams("sort=rating"), { sort: "new" });

    expect(href).toBe("/?sort=new");
  });

  it("removes a parameter when it is set to an empty value", () => {
    expect(buildHref("/", new URLSearchParams("q=x"), { q: "" })).toBe("/");
  });

  it("does not mutate the parameters it was given", () => {
    const params = new URLSearchParams("q=x");
    buildHref("/", params, { q: null });

    expect(params.get("q")).toBe("x");
  });
});
