import { useEffect, useRef, useState, useCallback } from "react";
import type { BoardState } from "../types";
import type { BoardStore } from "../store";

/**
 * Subscribes to the store and exposes board state as mutable local state so
 * drag interactions can reorder optimistically. While a drag is in progress,
 * incoming snapshots (e.g. from another tab) are buffered and applied after
 * the drop, so remote updates never yank items out from under the pointer.
 */
export function useBoard(store: BoardStore) {
  const [state, setState] = useState<BoardState>({
    columns: [],
    cards: [],
    members: [],
    loaded: false,
  });
  const draggingRef = useRef(false);
  const pendingRef = useRef<BoardState | null>(null);

  useEffect(() => {
    return store.subscribe((snapshot) => {
      if (draggingRef.current) {
        pendingRef.current = snapshot;
      } else {
        setState(snapshot);
      }
    });
  }, [store]);

  const beginDrag = useCallback(() => {
    draggingRef.current = true;
  }, []);

  /**
   * Ends the drag. `mutate` receives the freshest board (buffered remote
   * snapshot if one arrived mid-drag, otherwise current local state) and
   * returns the state to render while the persistence write is in flight.
   */
  const endDrag = useCallback((mutate?: (base: BoardState) => BoardState) => {
    draggingRef.current = false;
    setState((current) => {
      const base = pendingRef.current ?? current;
      pendingRef.current = null;
      return mutate ? mutate(base) : base;
    });
  }, []);

  return { state, beginDrag, endDrag };
}
