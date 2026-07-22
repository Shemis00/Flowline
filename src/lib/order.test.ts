import { describe, expect, it } from "vitest";
import { ORDER_GAP, needsRebalance, orderBetween, rebalancedOrders } from "./order";

describe("orderBetween", () => {
  it("returns the default gap when both neighbours are missing", () => {
    expect(orderBetween()).toBe(ORDER_GAP);
  });

  it("places an item before the first neighbour", () => {
    expect(orderBetween(undefined, 2048)).toBe(2048 - ORDER_GAP);
  });

  it("places an item after the last neighbour", () => {
    expect(orderBetween(1024, undefined)).toBe(1024 + ORDER_GAP);
  });

  it("returns the midpoint between two neighbours", () => {
    expect(orderBetween(1000, 2000)).toBe(1500);
  });
});

describe("needsRebalance", () => {
  it("is false when there is comfortable spacing", () => {
    expect(needsRebalance(1500, 1000, 2000)).toBe(false);
  });

  it("is true when the new key collapses into a neighbour", () => {
    expect(needsRebalance(1000, 1000, 1000 + 1e-7)).toBe(true);
    expect(needsRebalance(1000 + 1e-7, 1000, undefined)).toBe(true);
  });
});

describe("rebalancedOrders", () => {
  it("spaces keys evenly by ORDER_GAP", () => {
    expect(rebalancedOrders(3)).toEqual([ORDER_GAP, ORDER_GAP * 2, ORDER_GAP * 3]);
  });

  it("returns an empty list for zero items", () => {
    expect(rebalancedOrders(0)).toEqual([]);
  });
});
