import type { Card, Column, Member } from "../types";

/** Generic id → item lookup map. */
export function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

/** Deterministic card ordering: fractional key, then creation time, then id. */
export function byOrder(a: Card, b: Card): number {
  if (a.order !== b.order) return a.order - b.order;
  if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
  return a.id.localeCompare(b.id);
}

export function sortColumns(columns: Column[]): Column[] {
  return [...columns].sort((a, b) => a.order - b.order);
}

export function sortMembers(members: Member[]): Member[] {
  return [...members].sort((a, b) => a.createdAt - b.createdAt);
}

/** All cards in board order: column by column, top to bottom. */
export function boardOrderedCards(cards: Card[], sortedColumns: Column[]): Card[] {
  const sorted = [...cards].sort(byOrder);
  return sortedColumns.flatMap((col) => sorted.filter((c) => c.columnId === col.id));
}

/** Cards with no assignee, or whose assignee no longer exists. */
export function unassignedCards(cards: Card[], members: Member[]): Card[] {
  const memberIds = new Set(members.map((m) => m.id));
  return cards.filter((c) => !c.assigneeId || !memberIds.has(c.assigneeId));
}
