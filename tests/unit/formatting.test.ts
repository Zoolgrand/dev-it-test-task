import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "@/lib/relative-time";
import { selectPlural } from "@/lib/plural";

const forms = { one: "товар", few: "товари", many: "товарів" };

describe("relative time formatting", () => {
  const now = new Date("2026-09-14T12:00:00.000Z");

  it("reports a change made minutes ago in minutes", () => {
    expect(formatRelativeTime("2026-09-14T11:42:00.000Z", now)).toContain("18");
  });

  it("reports a change made hours ago in hours, not in minutes", () => {
    const formatted = formatRelativeTime("2026-09-14T10:00:00.000Z", now);

    expect(formatted).toContain("2");
    expect(formatted).not.toContain("120");
  });

  it("names yesterday instead of counting a single day", () => {
    expect(formatRelativeTime("2026-09-13T12:00:00.000Z", now)).toBe("Учора");
  });

  it("starts every label with a capital letter, because it opens a table cell", () => {
    const formatted = formatRelativeTime("2026-09-11T12:00:00.000Z", now);

    expect(formatted[0]).toBe(formatted[0]?.toUpperCase());
  });
});

describe("ukrainian plural selection", () => {
  it("uses the singular form for one item", () => {
    expect(selectPlural(1, forms)).toBe("товар");
  });

  it("uses the few form for two items", () => {
    expect(selectPlural(2, forms)).toBe("товари");
  });

  it("uses the many form for five items", () => {
    expect(selectPlural(5, forms)).toBe("товарів");
  });

  it("uses the many form for eleven items, where the last digit would mislead", () => {
    expect(selectPlural(11, forms)).toBe("товарів");
  });

  it("uses the many form for zero items", () => {
    expect(selectPlural(0, forms)).toBe("товарів");
  });
});
