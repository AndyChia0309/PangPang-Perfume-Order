import { describe, expect, it } from "vitest";
import { calculateOrderTotal, toQuantity } from "./orderTotal";

describe("calculateOrderTotal", () => {
  it("買 2 個小瓶時加上運費", () => {
    expect(calculateOrderTotal(2, 0)).toEqual({
      subtotal: 118,
      shippingFee: 35,
      total: 153,
    });
  });

  it("買小瓶、大瓶各 1", () => {
    expect(calculateOrderTotal(1, 1)).toEqual({
      subtotal: 379,
      shippingFee: 35,
      total: 414,
    });
  });

  it("什麼都沒買", () => {
    expect(calculateOrderTotal(0, 0)).toEqual({
      subtotal: 0,
      shippingFee: 0,
      total: 0,
    });
  });
});

describe("toQuantity", () => {
  it("選數字按鈕時回傳該數字", () => {
    expect(toQuantity("2", "")).toBe(2);
  });

  it("選「其他」並輸入 5 時回傳 5", () => {
    expect(toQuantity("other", "5")).toBe(5);
  });

  it("選「其他」但還沒輸入時回傳 0", () => {
    expect(toQuantity("other", "")).toBe(0);
  });

  it("選「其他」輸入小數時回傳 0", () => {
    expect(toQuantity("other", "1.5")).toBe(0);
  });
});
