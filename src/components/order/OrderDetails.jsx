import OrderSummary from "./OrderSummary";

function OrderDetails({ order }) {
  const details = [
    {
      label: "收件人",
      text: `${order.recipient_name}（${order.recipient_phone}）`,
    },
    {
      label: "收件方式",
      text: `${order.pickup_method}・${order.pickup_store_address}`,
    },
    { label: "備註", text: order.note },
  ].filter(({ text }) => text);

  return (
    <>
      <dl className="grid gap-1 rounded-card bg-brand-soft px-5 py-4 text-caption">
        {details.map(({ label, text }) => (
          <div key={label} className="flex gap-2">
            <dt className="shrink-0 font-semibold text-brand">{label}</dt>
            <dd className="text-ink-muted">{text}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <OrderSummary smallQty={order.small_qty} largeQty={order.large_qty} />
      </div>
    </>
  );
}

export default OrderDetails;
