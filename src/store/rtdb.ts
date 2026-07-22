import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  remove,
  push,
  runTransaction,
  type Database,
} from "firebase/database";
import type { BoardState, Card, CardUpdate, Column, Member } from "../types";
import type { BoardStore } from "./types";
import { DEFAULT_COLUMNS } from "./seed";
import { ORDER_GAP } from "../lib/order";

const BOARD_PATH = "boards/default";

interface CardNode {
  title: string;
  description?: string;
  dueDate?: string;
  assigneeId?: string;
  columnId: string;
  order: number;
  createdAt: number;
}

interface ColumnNode {
  title: string;
  order: number;
}

interface MemberNode {
  name: string;
  createdAt: number;
}

/**
 * Firebase Realtime Database backend. Data layout:
 *
 *   boards/default/columns/{colId}: { title, order }
 *   boards/default/cards/{cardId}:  { title, description?, dueDate?, assigneeId?, columnId, order, createdAt }
 *   boards/default/members/{memberId}: { name, createdAt }
 *
 * `onValue` gives realtime sync with latency compensation (local writes are
 * reflected immediately, then confirmed by the server).
 */
export class RtdbStore implements BoardStore {
  private db: Database;

  constructor(config: Record<string, string>) {
    const app = initializeApp(config);
    this.db = getDatabase(app);
  }

  subscribe(listener: (state: BoardState) => void): () => void {
    let seeded = false;
    return onValue(ref(this.db, BOARD_PATH), (snap) => {
      const value = (snap.val() ?? {}) as {
        columns?: Record<string, ColumnNode>;
        cards?: Record<string, CardNode>;
        members?: Record<string, MemberNode>;
      };

      if (!value.columns && !seeded) {
        seeded = true;
        void this.seedColumns();
      }

      const columns: Column[] = Object.entries(value.columns ?? {}).map(([id, col]) => ({
        id,
        ...col,
      }));
      const cards: Card[] = Object.entries(value.cards ?? {}).map(([id, card]) => ({
        id,
        ...card,
      }));
      const members: Member[] = Object.entries(value.members ?? {}).map(([id, member]) => ({
        id,
        ...member,
      }));
      listener({ columns, cards, members, loaded: true });
    });
  }

  /** Transaction so two clients racing on an empty board seed exactly once. */
  private async seedColumns(): Promise<void> {
    const columns: Record<string, ColumnNode> = {};
    DEFAULT_COLUMNS.forEach((title, i) => {
      columns[`col-${i}`] = { title, order: (i + 1) * ORDER_GAP };
    });
    await runTransaction(ref(this.db, `${BOARD_PATH}/columns`), (current) =>
      current === null ? columns : undefined,
    );
  }

  async addCard(columnId: string, title: string): Promise<void> {
    const node: CardNode = { title, columnId, order: Date.now(), createdAt: Date.now() };
    await set(push(ref(this.db, `${BOARD_PATH}/cards`)), node);
  }

  async updateCard(cardId: string, updates: CardUpdate): Promise<void> {
    // RTDB semantics: `null` deletes the key, `undefined` is not allowed —
    // so drop undefined entries and let nulls clear optional fields.
    const payload: Record<string, string | null> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) payload[key] = val;
    }
    if (Object.keys(payload).length === 0) return;
    await update(ref(this.db, `${BOARD_PATH}/cards/${cardId}`), payload);
  }

  async deleteCard(cardId: string): Promise<void> {
    await remove(ref(this.db, `${BOARD_PATH}/cards/${cardId}`));
  }

  async moveCard(cardId: string, columnId: string, order: number): Promise<void> {
    await update(ref(this.db, `${BOARD_PATH}/cards/${cardId}`), { columnId, order });
  }

  /** Atomic multi-path update: all order keys change in one round trip. */
  async rebalanceColumn(entries: { cardId: string; order: number }[]): Promise<void> {
    const updates: Record<string, number> = {};
    for (const { cardId, order } of entries) {
      updates[`${BOARD_PATH}/cards/${cardId}/order`] = order;
    }
    await update(ref(this.db), updates);
  }

  async addColumn(title: string, order: number): Promise<void> {
    const node: ColumnNode = { title, order };
    await set(push(ref(this.db, `${BOARD_PATH}/columns`)), node);
  }

  async moveColumn(columnId: string, order: number): Promise<void> {
    await update(ref(this.db, `${BOARD_PATH}/columns/${columnId}`), { order });
  }

  async rebalanceColumns(entries: { columnId: string; order: number }[]): Promise<void> {
    const updates: Record<string, number> = {};
    for (const { columnId, order } of entries) {
      updates[`${BOARD_PATH}/columns/${columnId}/order`] = order;
    }
    await update(ref(this.db), updates);
  }

  async deleteColumn(columnId: string): Promise<void> {
    await remove(ref(this.db, `${BOARD_PATH}/columns/${columnId}`));
  }

  async addMember(name: string): Promise<void> {
    const node: MemberNode = { name, createdAt: Date.now() };
    await set(push(ref(this.db, `${BOARD_PATH}/members`)), node);
  }

  async deleteMember(memberId: string): Promise<void> {
    await remove(ref(this.db, `${BOARD_PATH}/members/${memberId}`));
  }
}
