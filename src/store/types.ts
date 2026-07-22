import type { BoardState, CardUpdate } from "../types";

/**
 * Persistence abstraction. The board UI is identical regardless of backend:
 * - RtdbStore: Firebase Realtime Database sync (used when Firebase env vars are set)
 * - LocalStore: localStorage fallback so the app runs with zero setup
 */
export interface BoardStore {
  /** Subscribe to board snapshots. Returns an unsubscribe function. */
  subscribe(listener: (state: BoardState) => void): () => void;

  addCard(columnId: string, title: string): Promise<void>;
  updateCard(cardId: string, updates: CardUpdate): Promise<void>;
  deleteCard(cardId: string): Promise<void>;
  /** Move a card to a column with a new fractional order key (single-node write). */
  moveCard(cardId: string, columnId: string, order: number): Promise<void>;
  /** Rewrite order keys for an entire column (used when fractional keys collide). */
  rebalanceColumn(entries: { cardId: string; order: number }[]): Promise<void>;

  addColumn(title: string, order: number): Promise<void>;
  /** Callers must ensure the column is empty first. */
  deleteColumn(columnId: string): Promise<void>;

  addMember(name: string): Promise<void>;
  deleteMember(memberId: string): Promise<void>;
}
