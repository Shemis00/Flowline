import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { applyTheme, getStoredTheme, useTheme } from "./useTheme";

describe("theme helpers", () => {
  it("defaults to dark and persists light when toggled", () => {
    expect(getStoredTheme()).toBe("dark");

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(localStorage.getItem("kanban-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("restores a saved light preference", () => {
    localStorage.setItem("kanban-theme", "light");
    applyTheme("light");

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    expect(getStoredTheme()).toBe("light");
  });
});
