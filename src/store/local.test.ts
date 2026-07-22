import { describe, expect, it } from "vitest";
import { LocalStore } from "./local";
import { ORDER_GAP } from "../lib/order";
import type { BoardState } from "../types";

async function getState(store: LocalStore): Promise<BoardState> {
  return await new Promise((resolve) => {
    let unsub = () => {};
    unsub = store.subscribe((state) => {
      unsub();
      resolve(state);
    });
  });
}

describe("LocalStore", () => {
  it("seeds default columns on a fresh board", async () => {
    const store = new LocalStore();
    const state = await getState(store);
    expect(state.loaded).toBe(true);
    expect(state.columns.length).toBeGreaterThan(0);
    expect(state.cards).toEqual([]);
    expect(state.members).toEqual([]);
  });

  it("adds, updates, moves, and deletes cards", async () => {
    const store = new LocalStore();
    let state = await getState(store);
    const columnId = state.columns[0].id;

    await store.addCard(columnId, "Ship tests");
    state = await getState(store);
    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].title).toBe("Ship tests");

    const cardId = state.cards[0].id;
    await store.updateCard(cardId, {
      description: "Cover LocalStore",
      dueDate: "2026-08-01",
    });
    state = await getState(store);
    expect(state.cards[0].description).toBe("Cover LocalStore");
    expect(state.cards[0].dueDate).toBe("2026-08-01");

    const target = state.columns[1]?.id ?? columnId;
    await store.moveCard(cardId, target, ORDER_GAP * 5);
    state = await getState(store);
    expect(state.cards[0].columnId).toBe(target);
    expect(state.cards[0].order).toBe(ORDER_GAP * 5);

    await store.deleteCard(cardId);
    state = await getState(store);
    expect(state.cards).toHaveLength(0);
  });

  it("rebalances card order keys in a column", async () => {
    const store = new LocalStore();
    let state = await getState(store);
    const columnId = state.columns[0].id;

    await store.addCard(columnId, "A");
    await store.addCard(columnId, "B");
    state = await getState(store);
    const [a, b] = state.cards;

    await store.rebalanceColumn([
      { cardId: a.id, order: ORDER_GAP },
      { cardId: b.id, order: ORDER_GAP * 2 },
    ]);
    state = await getState(store);
    const byId = Object.fromEntries(state.cards.map((c) => [c.id, c.order]));
    expect(byId[a.id]).toBe(ORDER_GAP);
    expect(byId[b.id]).toBe(ORDER_GAP * 2);
  });

  it("adds, reorders, and deletes columns", async () => {
    const store = new LocalStore();
    let state = await getState(store);
    const before = state.columns.length;

    await store.addColumn("Review", ORDER_GAP * 99);
    state = await getState(store);
    expect(state.columns).toHaveLength(before + 1);
    const review = state.columns.find((c) => c.title === "Review");
    expect(review).toBeDefined();

    await store.moveColumn(review!.id, 1);
    state = await getState(store);
    expect(state.columns.find((c) => c.id === review!.id)?.order).toBe(1);

    await store.rebalanceColumns(
      state.columns.map((c, i) => ({ columnId: c.id, order: (i + 1) * ORDER_GAP })),
    );
    state = await getState(store);
    expect(state.columns.every((c) => c.order % ORDER_GAP === 0)).toBe(true);

    await store.deleteColumn(review!.id);
    state = await getState(store);
    expect(state.columns.find((c) => c.id === review!.id)).toBeUndefined();
  });

  it("manages members", async () => {
    const store = new LocalStore();
    await store.addMember("Ada");
    let state = await getState(store);
    expect(state.members).toHaveLength(1);
    expect(state.members[0].name).toBe("Ada");

    await store.deleteMember(state.members[0].id);
    state = await getState(store);
    expect(state.members).toHaveLength(0);
  });

  it("persists across LocalStore instances via localStorage", async () => {
    const store = new LocalStore();
    const state = await getState(store);
    await store.addCard(state.columns[0].id, "Persisted");

    const again = new LocalStore();
    const restored = await getState(again);
    expect(restored.cards.some((c) => c.title === "Persisted")).toBe(true);
  });
});
