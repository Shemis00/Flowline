import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatFriendlyDate, formatShortDate, isOverdue, todayISO } from "./date";

describe("todayISO", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats the local calendar date as YYYY-MM-DD", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 22, 15, 30, 0));
    expect(todayISO()).toBe("2026-07-22");
  });
});

describe("isOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 22, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is true for dates before today", () => {
    expect(isOverdue("2026-07-21")).toBe(true);
  });

  it("is false for today and future dates", () => {
    expect(isOverdue("2026-07-22")).toBe(false);
    expect(isOverdue("2026-07-23")).toBe(false);
  });
});

describe("date formatters", () => {
  it("formats short and friendly labels", () => {
    expect(formatShortDate("2026-07-22")).toMatch(/Jul/);
    expect(formatFriendlyDate("2026-07-22")).toMatch(/Jul/);
  });

  it("falls back to the raw string for invalid input", () => {
    expect(formatShortDate("not-a-date")).toBe("not-a-date");
    expect(formatFriendlyDate("not-a-date")).toBe("not-a-date");
  });
});
