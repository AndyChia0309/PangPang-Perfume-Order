import { PRODUCTS, SHIPPING_FEE } from "../data/pricing";

export function calculateOrderTotal(smallQty, largeQty) {
  const subtotal =
    smallQty * PRODUCTS.small.price + largeQty * PRODUCTS.large.price;
  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shippingFee;

  return { subtotal, shippingFee, total };
}
