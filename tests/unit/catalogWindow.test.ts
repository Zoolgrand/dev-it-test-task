import { describe, expect, it } from "vitest";
import {
  CATALOG_MAX_VISIBLE,
  CATALOG_PAGE_SIZE,
  resolveCatalogWindow,
} from "@/domain/product/catalogWindow";

describe("the slice of the catalogue a request may load", () => {
  it("shows one page when the visitor asked for no particular amount", () => {
    expect(resolveCatalogWindow("", false).limit).toBe(CATALOG_PAGE_SIZE);
  });

  it("falls back to one page when the parameter is not a number", () => {
    expect(resolveCatalogWindow("усі", false).limit).toBe(CATALOG_PAGE_SIZE);
  });

  it("falls back to one page for a zero or negative amount", () => {
    expect(resolveCatalogWindow("0", false).limit).toBe(CATALOG_PAGE_SIZE);
    expect(resolveCatalogWindow("-20", false).limit).toBe(CATALOG_PAGE_SIZE);
  });

  it("honours an amount the visitor reached by asking for more", () => {
    expect(resolveCatalogWindow(String(CATALOG_PAGE_SIZE * 2), false).limit).toBe(
      CATALOG_PAGE_SIZE * 2,
    );
  });

  it("never reads more rows than the ceiling, however large the parameter", () => {
    const window = resolveCatalogWindow("999999", false);

    expect(window.limit).toBe(CATALOG_MAX_VISIBLE);
    expect(window.scan).toBe(CATALOG_MAX_VISIBLE);
  });

  it("stops offering more once the ceiling is reached", () => {
    expect(resolveCatalogWindow(String(CATALOG_MAX_VISIBLE), false).nextLimit).toBeNull();
  });

  it("offers the next page while the ceiling is still ahead", () => {
    expect(resolveCatalogWindow("", false).nextLimit).toBe(CATALOG_PAGE_SIZE * 2);
  });

  it("reads no further than the ceiling when the order is computed in memory", () => {
    expect(resolveCatalogWindow("", true).scan).toBe(CATALOG_MAX_VISIBLE);
  });

  it("reads only what it shows when the database can do the ordering", () => {
    expect(resolveCatalogWindow("", false).scan).toBe(CATALOG_PAGE_SIZE);
  });
});
