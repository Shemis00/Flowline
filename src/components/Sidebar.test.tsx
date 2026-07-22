import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("switches views when a nav item is clicked", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    render(<Sidebar view="dashboard" onViewChange={onViewChange} />);

    await user.click(screen.getByRole("button", { name: "Kanban" }));
    expect(onViewChange).toHaveBeenCalledWith("kanban");
  });

  it("toggles theme from the sidebar control", async () => {
    const user = userEvent.setup();

    render(<Sidebar view="dashboard" onViewChange={vi.fn()} />);

    const toggle = screen.getByRole("button", { name: "Light mode" });
    await user.click(toggle);

    expect(localStorage.getItem("kanban-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(screen.getByRole("button", { name: "Dark mode" })).toBeInTheDocument();
  });
});
