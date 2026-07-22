import { describe, expect, it } from "vitest";
import {
  boardOrderedCards,
  byId,
  byOrder,
  sortColumns,
  sortMembers,
  unassignedCards,
} from "./board";
import type { Card, Column, Member } from "../types";

const card = (partial: Partial<Card> & Pick<Card, "id" | "columnId" | "order">): Card => ({
  title: partial.title ?? partial.id,
  createdAt: partial.createdAt ?? 0,
  ...partial,
});

describe("byId", () => {
  it("indexes items by id", () => {
    const map = byId([{ id: "a" }, { id: "b" }]);
    expect(map.get("a")).toEqual({ id: "a" });
    expect(map.get("missing")).toBeUndefined();
  });
});

describe("byOrder", () => {
  it("sorts by order, then createdAt, then id", () => {
    const items = [
      card({ id: "c", columnId: "col", order: 1, createdAt: 2 }),
      card({ id: "a", columnId: "col", order: 1, createdAt: 1 }),
      card({ id: "b", columnId: "col", order: 0, createdAt: 9 }),
    ];
    expect([...items].sort(byOrder).map((c) => c.id)).toEqual(["b", "a", "c"]);
  });
});

describe("sortColumns / sortMembers", () => {
  it("sorts columns by order", () => {
    const columns: Column[] = [
      { id: "2", title: "Done", order: 200 },
      { id: "1", title: "Todo", order: 100 },
    ];
    expect(sortColumns(columns).map((c) => c.id)).toEqual(["1", "2"]);
  });

  it("sorts members by join date", () => {
    const members: Member[] = [
      { id: "2", name: "Bo", createdAt: 20 },
      { id: "1", name: "Ada", createdAt: 10 },
    ];
    expect(sortMembers(members).map((m) => m.id)).toEqual(["1", "2"]);
  });
});

describe("boardOrderedCards", () => {
  it("walks columns left-to-right and cards top-to-bottom", () => {
    const columns: Column[] = [
      { id: "todo", title: "Todo", order: 1 },
      { id: "doing", title: "Doing", order: 2 },
    ];
    const cards = [
      card({ id: "c2", columnId: "todo", order: 2 }),
      card({ id: "c1", columnId: "todo", order: 1 }),
      card({ id: "d1", columnId: "doing", order: 1 }),
    ];
    expect(boardOrderedCards(cards, columns).map((c) => c.id)).toEqual(["c1", "c2", "d1"]);
  });
});

describe("unassignedCards", () => {
  it("includes cards with no assignee or a deleted assignee", () => {
    const members: Member[] = [{ id: "m1", name: "Ada", createdAt: 1 }];
    const cards = [
      card({ id: "open", columnId: "todo", order: 1 }),
      card({ id: "owned", columnId: "todo", order: 2, assigneeId: "m1" }),
      card({ id: "orphan", columnId: "todo", order: 3, assigneeId: "gone" }),
    ];
    expect(unassignedCards(cards, members).map((c) => c.id)).toEqual(["open", "orphan"]);
  });
});
