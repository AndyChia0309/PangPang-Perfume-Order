import { PRODUCTS, SHIPPING_FEE } from "../data/pricing";

export function calculateOrderTotal(smallQty, largeQty) {
  const subtotal =
    smallQty * PRODUCTS.small.price + largeQty * PRODUCTS.large.price;
  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shippingFee;

  return { subtotal, shippingFee, total };
}

export function toQuantity(selected, other) {
  const value = selected === "other" ? other : selected;
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : 0;
}
