import { describe, expect, it } from "vitest";
import { createOrderFromFormData } from "./orderForm";

function buildFormData(overrides = {}) {
  const fields = {
    customerName: "王小明",
    phone: "0912345678",
    email: "test@example.com",
    instagram: "",
    smallQuantity: "1",
    largeQuantity: "0",
    pickupMethod: "超商自取",
    pickupStoreAddress: "7-11 中壢門市",
    privacyAgreed: "on",
    ...overrides,
  };

  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    formData.set(name, value);
  }
  return formData;
}

describe("createOrderFromFormData", () => {
  it("填寫正確時回傳訂單資料", () => {
    const { order, errorMessage } = createOrderFromFormData(buildFormData());

    expect(errorMessage).toBeUndefined();
    expect(order).toEqual({
      customer_name: "王小明",
      phone: "0912345678",
      email: "test@example.com",
      instagram: "",
      small_qty: 1,
      large_qty: 0,
      pickup_method: "超商自取",
      pickup_store_address: "7-11 中壢門市",
      recipient_name: "王小明",
      recipient_phone: "0912345678",
      note: "",
      privacy_agreed: true,
    });
  });

  it("選「其他」並使用輸入的數量", () => {
    const { order } = createOrderFromFormData(
      buildFormData({ smallQuantity: "other", smallQuantityOther: "5" }),
    );

    expect(order.small_qty).toBe(5);
  });

  it("兩種數量都是 0 時回傳錯誤", () => {
    const { order, errorMessage } = createOrderFromFormData(
      buildFormData({ smallQuantity: "0", largeQuantity: "0" }),
    );

    expect(errorMessage).toBe("請至少選擇一項商品數量。");
    expect(order).toBeUndefined();
  });

  it("「其他」輸入小數時回傳錯誤", () => {
    const { order, errorMessage } = createOrderFromFormData(
      buildFormData({ smallQuantity: "other", smallQuantityOther: "1.5" }),
    );
    expect(errorMessage).toBe("請輸入正確的商品數量。");
    expect(order).toBeUndefined();
  });

  it("沒填姓名時回傳錯誤", () => {
    const { order, errorMessage } = createOrderFromFormData(
      buildFormData({ customerName: "" }),
    );

    expect(errorMessage).toBe("請填寫姓名。");
    expect(order).toBeUndefined();
  });

  it("沒填電話時回傳錯誤", () => {
    const { order, errorMessage } = createOrderFromFormData(
      buildFormData({ phone: "" }),
    );

    expect(errorMessage).toBe("請填寫電話。");
    expect(order).toBeUndefined();
  });

  it("沒填Email時回傳錯誤", () => {
    const { order, errorMessage } = createOrderFromFormData(
      buildFormData({ email: "" }),
    );

    expect(errorMessage).toBe("請填寫Email。");
    expect(order).toBeUndefined();
  });

  it("沒填門市地址時回傳錯誤", () => {
    const { order, errorMessage } = createOrderFromFormData(
      buildFormData({ pickupStoreAddress: "" }),
    );

    expect(errorMessage).toBe("請填寫收件門市地址。");
    expect(order).toBeUndefined();
  });

  it("姓名前後有空白時會自動去掉", () => {
    const { order, errorMessage } = createOrderFromFormData(
      buildFormData({ customerName: "王小明    " }),
    );

    expect(errorMessage).toBeUndefined();
    expect(order.customer_name).toBe("王小明");
  });

  it("有填收件人時使用收件人資料", () => {
    const { order, errorMessage } = createOrderFromFormData(
      buildFormData({
        recipientName: "李小華",
        recipientPhone: "0987654321",
      }),
    );

    expect(errorMessage).toBeUndefined();
    expect(order.recipient_name).toBe("李小華");
    expect(order.recipient_phone).toBe("0987654321");
  });

  it("未勾選隱私權同意時回傳錯誤", () => {
    const { order, errorMessage } = createOrderFromFormData(
      buildFormData({ privacyAgreed: undefined }),
    );

    expect(errorMessage).toBe("請同意隱私權政策。");
    expect(order).toBeUndefined();
  });
});
