import type { BoardState, Card, CardUpdate, Column, Member } from "../types";
import type { BoardStore } from "./types";
import { DEFAULT_COLUMNS } from "./seed";
import { ORDER_GAP } from "../lib/order";

const STORAGE_KEY = "kanban-board-v1";

interface PersistedData {
  columns: Column[];
  cards: Card[];
  members: Member[];
}

function load(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedData>;
      return {
        columns: parsed.columns ?? [],
        cards: parsed.cards ?? [],
        members: parsed.members ?? [],
      };
    }
  } catch {
    // Corrupt data: fall through to a fresh board.
  }
  return {
    columns: DEFAULT_COLUMNS.map((title, i) => ({
      id: `col-${i}`,
      title,
      order: (i + 1) * ORDER_GAP,
    })),
    cards: [],
    members: [],
  };
}

/**
 * Zero-setup fallback used when no Firebase config is present.
 * Syncs across tabs via the `storage` event.
 */
export class LocalStore implements BoardStore {
  private data: PersistedData = load();
  private listeners = new Set<(state: BoardState) => void>();

  constructor() {
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        this.data = load();
        this.emit();
      }
    });
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.emit();
  }

  private snapshot(): BoardState {
    return {
      columns: [...this.data.columns],
      cards: [...this.data.cards],
      members: [...this.data.members],
      loaded: true,
    };
  }

  private emit() {
    const state = this.snapshot();
    this.listeners.forEach((l) => l(state));
  }

  subscribe(listener: (state: BoardState) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  async addCard(columnId: string, title: string): Promise<void> {
    this.data.cards.push({
      id: crypto.randomUUID(),
      title,
      columnId,
      order: Date.now(),
      createdAt: Date.now(),
    });
    this.persist();
  }

  async updateCard(cardId: string, updates: CardUpdate): Promise<void> {
    const card = this.data.cards.find((c) => c.id === cardId);
    if (!card) return;
    if (updates.title !== undefined) card.title = updates.title;
    for (const key of ["description", "dueDate", "assigneeId"] as const) {
      const val = updates[key];
      if (val === undefined) continue;
      if (val === null) delete card[key];
      else card[key] = val;
    }
    this.persist();
  }

  async deleteCard(cardId: string): Promise<void> {
    this.data.cards = this.data.cards.filter((c) => c.id !== cardId);
    this.persist();
  }

  async moveCard(cardId: string, columnId: string, order: number): Promise<void> {
    const card = this.data.cards.find((c) => c.id === cardId);
    if (card) {
      card.columnId = columnId;
      card.order = order;
      this.persist();
    }
  }

  async rebalanceColumn(entries: { cardId: string; order: number }[]): Promise<void> {
    for (const { cardId, order } of entries) {
      const card = this.data.cards.find((c) => c.id === cardId);
      if (card) card.order = order;
    }
    this.persist();
  }

  async addColumn(title: string, order: number): Promise<void> {
    this.data.columns.push({ id: crypto.randomUUID(), title, order });
    this.persist();
  }

  async deleteColumn(columnId: string): Promise<void> {
    this.data.columns = this.data.columns.filter((c) => c.id !== columnId);
    this.persist();
  }

  async addMember(name: string): Promise<void> {
    this.data.members.push({ id: crypto.randomUUID(), name, createdAt: Date.now() });
    this.persist();
  }

  async deleteMember(memberId: string): Promise<void> {
    this.data.members = this.data.members.filter((m) => m.id !== memberId);
    this.persist();
  }
}
