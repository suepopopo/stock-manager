import { describe, expect, it } from "vitest";
import { isValidYearMonth, monthRange } from "./monthRange.js";

describe("monthRange", () => {
  it("通常月：翌月1日をendとする", () => {
    expect(monthRange("2026-07")).toEqual({ start: "2026-07-01", end: "2026-08-01" });
  });

  it("12月をまたぐ場合は年が繰り上がる", () => {
    expect(monthRange("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
  });

  it("不正なyearMonthはエラー", () => {
    expect(() => monthRange("2026-13")).toThrow();
    expect(() => monthRange("2026-7")).toThrow();
    expect(() => monthRange("not-a-date")).toThrow();
  });
});

describe("isValidYearMonth", () => {
  it("YYYY-MM形式ならtrue", () => {
    expect(isValidYearMonth("2026-01")).toBe(true);
    expect(isValidYearMonth("2026-12")).toBe(true);
  });

  it("それ以外はfalse", () => {
    expect(isValidYearMonth("2026-00")).toBe(false);
    expect(isValidYearMonth("2026-13")).toBe(false);
    expect(isValidYearMonth("2026/07")).toBe(false);
  });
});
