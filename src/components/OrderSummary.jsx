import { PRODUCTS } from "../../shared/pricing";
import { calculateOrderTotal } from "../../shared/orderTotal";
import { useId } from "react";

function OrderSummary({ smallQty, largeQty }) {
  const titleId = useId();
  const { shippingFee, total } = calculateOrderTotal(smallQty, largeQty);

  const items = [
    { product: PRODUCTS.small, qty: smallQty },
    { product: PRODUCTS.large, qty: largeQty },
  ].filter((item) => item.qty > 0);

  return (
    <section
      aria-labelledby={titleId}
      className="card px-5 py-4"
    >
      <h2 id={titleId} className="field-label">
        訂單明細
      </h2>

      {items.length === 0 ? (
        <p className="mt-2 text-caption text-ink-subtle">尚未選擇商品</p>
      ) : (
        <dl className="mt-3 grid gap-2 text-body">
          {items.map(({ product, qty }) => (
            <div key={product.name} className="flex justify-between">
              <dt className="text-ink-muted">
                {product.name} × {qty}
              </dt>
              <dd>${product.price * qty}</dd>
            </div>
          ))}

          <div className="flex justify-between">
            <dt className="text-ink-muted">運費</dt>
            <dd>${shippingFee}</dd>
          </div>

          <div className="flex justify-between border-t border-line pt-2">
            <dt className="font-semibold text-brand">總金額</dt>
            <dd className="font-semibold text-brand">${total}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

export default OrderSummary;
