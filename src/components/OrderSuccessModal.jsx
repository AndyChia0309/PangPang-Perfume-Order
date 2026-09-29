import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import OrderSummary from "./OrderSummary";

function OrderSuccessModal({ order, onClose }) {
  const dialogRef = useRef(null);

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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) dialogRef.current.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="order-success-title"
      className="m-auto w-[calc(100%-2rem)] max-w-[520px] rounded-card bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop:bg-black/40 max-h-[calc(100dvh-2rem)] overflow-y-auto"
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <div className="relative p-8">
        <button
          className="absolute top-3 right-3.5 p-1 text-ink-subtle hover:text-ink"
          type="button"
          onClick={() => dialogRef.current.close()}
          aria-label="關閉"
        >
          <X className="size-6" aria-hidden="true" />
        </button>

        <h2
          id="order-success-title"
          className="mb-3 text-heading font-semibold text-brand"
        >
          訂單完成
        </h2>

        <p className="text-body text-ink-muted">
          訂單確認後，我們將在兩日內寄送訂單資訊給您，再麻煩至 Email 或 IG
          帳號查收訂單確認資訊及匯款資料。
        </p>

        <dl className="grid gap-1 rounded-card bg-brand-soft px-5 py-4 mt-6 text-caption">
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
      </div>
    </dialog>
  );
}

export default OrderSuccessModal;
