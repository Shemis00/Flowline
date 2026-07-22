import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useBoard } from "./useBoard";
import type { BoardStore } from "../store";
import type { BoardState, Card } from "../types";

function createMockStore(initial: BoardState): BoardStore & { emit: (s: BoardState) => void } {
  let listener: ((state: BoardState) => void) | null = null;
  return {
    subscribe(fn) {
      listener = fn;
      fn(initial);
      return () => {
        listener = null;
      };
    },
    emit(state) {
      listener?.(state);
    },
    addCard: vi.fn(async () => undefined),
    updateCard: vi.fn(async () => undefined),
    deleteCard: vi.fn(async () => undefined),
    moveCard: vi.fn(async () => undefined),
    rebalanceColumn: vi.fn(async () => undefined),
    addColumn: vi.fn(async () => undefined),
    moveColumn: vi.fn(async () => undefined),
    rebalanceColumns: vi.fn(async () => undefined),
    deleteColumn: vi.fn(async () => undefined),
    addMember: vi.fn(async () => undefined),
    deleteMember: vi.fn(async () => undefined),
  };
}

describe("useBoard", () => {
  it("exposes the first store snapshot", async () => {
    const store = createMockStore({
      columns: [{ id: "c1", title: "Todo", order: 1 }],
      cards: [],
      members: [],
      loaded: true,
    });

    const { result } = renderHook(() => useBoard(store));
    await waitFor(() => expect(result.current.state.loaded).toBe(true));
    expect(result.current.state.columns).toHaveLength(1);
  });

  it("buffers remote snapshots while dragging and applies them after endDrag", async () => {
    const card: Card = {
      id: "card-1",
      title: "Task",
      columnId: "c1",
      order: 1,
      createdAt: 1,
    };
    const store = createMockStore({
      columns: [{ id: "c1", title: "Todo", order: 1 }],
      cards: [card],
      members: [],
      loaded: true,
    });

    const { result } = renderHook(() => useBoard(store));
    await waitFor(() => expect(result.current.state.loaded).toBe(true));

    act(() => {
      result.current.beginDrag();
    });

    act(() => {
      store.emit({
        columns: [{ id: "c1", title: "Todo", order: 1 }],
        cards: [{ ...card, title: "Remote edit" }],
        members: [],
        loaded: true,
      });
    });

    // Mid-drag: keep the pre-drag local snapshot.
    expect(result.current.state.cards[0].title).toBe("Task");

    act(() => {
      result.current.endDrag((base) => ({
        ...base,
        cards: base.cards.map((c) => (c.id === "card-1" ? { ...c, order: 99 } : c)),
      }));
    });

    expect(result.current.state.cards[0].title).toBe("Remote edit");
    expect(result.current.state.cards[0].order).toBe(99);
  });
});
