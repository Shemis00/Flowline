import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardView } from "./DashboardView";
import type { Card, Column, Member } from "../../types";

const columns: Column[] = [
  { id: "todo", title: "Todo", order: 1 },
  { id: "done", title: "Done", order: 2 },
];

const members: Member[] = [{ id: "m1", name: "Ada", createdAt: 1 }];

const cards: Card[] = [
  {
    id: "c1",
    title: "Write tests",
    columnId: "todo",
    order: 1,
    createdAt: 1,
    assigneeId: "m1",
    dueDate: "2099-01-01",
  },
  {
    id: "c2",
    title: "Ship it",
    columnId: "done",
    order: 1,
    createdAt: 2,
  },
];

describe("DashboardView", () => {
  it("renders headline stats and opens a deadline card", async () => {
    const user = userEvent.setup();
    const onOpenCard = vi.fn();

    render(
      <DashboardView cards={cards} columns={columns} members={members} onOpenCard={onOpenCard} />,
    );

    expect(screen.getByText("Total tasks")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Team members")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Write tests/i }));
    expect(onOpenCard).toHaveBeenCalledWith("c1");
  });
});
