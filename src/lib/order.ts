/**
 * Fractional ordering: each card carries a numeric `order` key and a column is
 * sorted by it. Inserting between two neighbours only writes ONE document
 * (the moved card) instead of rewriting every card below the drop position.
 */

export const ORDER_GAP = 1024;

/** Minimum spacing between neighbours before floating-point midpoints stop being distinct. */
const MIN_GAP = 1e-6;

/** Compute the order key for inserting between `before` and `after` (either may be absent). */
export function orderBetween(before?: number, after?: number): number {
  if (before === undefined && after === undefined) return ORDER_GAP;
  if (before === undefined) return (after as number) - ORDER_GAP;
  if (after === undefined) return before + ORDER_GAP;
  return (before + after) / 2;
}

/**
 * After repeated inserts in the same spot, midpoints converge and can collide.
 * When the computed key is too close to a neighbour, the whole column gets
 * re-spaced with fresh keys (a rare, small batch write).
 */
export function needsRebalance(order: number, before?: number, after?: number): boolean {
  if (before !== undefined && Math.abs(order - before) < MIN_GAP) return true;
  if (after !== undefined && Math.abs(after - order) < MIN_GAP) return true;
  return false;
}

/** Evenly spaced keys for a full-column rewrite. */
export function rebalancedOrders(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * ORDER_GAP);
}
