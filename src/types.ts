export interface Card {
  id: string;
  title: string;
  description?: string;
  /** ISO date string (YYYY-MM-DD). */
  dueDate?: string;
  /** Id of the assigned team member. */
  assigneeId?: string;
  columnId: string;
  /** Fractional ordering key. Cards in a column sort ascending by this value. */
  order: number;
  createdAt: number;
}

/** Editable card fields. `null` clears a field, `undefined` leaves it untouched. */
export interface CardUpdate {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface Member {
  id: string;
  name: string;
  createdAt: number;
}

export interface BoardState {
  columns: Column[];
  cards: Card[];
  members: Member[];
  /** False until the first snapshot from the backing store arrives. */
  loaded: boolean;
}
