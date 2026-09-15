import { describe, expect, it } from "vitest";
import { parseDate, daysSince, isoDate } from "./dates";

describe("parseDate", () => {
  it("parses ISO strings", () => {
    expect(parseDate("2026-09-08T10:24:00+08:00")).toBe(
      Date.parse("2026-09-08T10:24:00+08:00")
    );
  });
  it("parses date-only", () => {
    expect(parseDate("2026-09-08")).toBe(Date.parse("2026-09-08"));
  });
  it("handles seconds vs ms numbers", () => {
    expect(parseDate(1700000000)).toBe(1700000000 * 1000);
    expect(parseDate(1700000000000)).toBe(1700000000000);
  });
  it("returns undefined for junk", () => {
    expect(parseDate("not a date")).toBeUndefined();
    expect(parseDate(null)).toBeUndefined();
    expect(parseDate(undefined)).toBeUndefined();
  });
});

describe("daysSince", () => {
  it("computes days", () => {
    const now = Date.parse("2026-01-31T00:00:00Z");
    const then = Date.parse("2026-01-01T00:00:00Z");
    expect(daysSince(then, now)).toBe(30);
  });
});

describe("isoDate", () => {
  it("returns yyyy-mm-dd", () => {
    expect(isoDate(Date.parse("2026-09-08T10:00:00Z"))).toBe("2026-09-08");
  });
});
