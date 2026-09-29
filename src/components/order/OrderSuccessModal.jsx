import { X } from "lucide-react";
import { useDialog } from "../../hooks/useDialog";
import OrderDetails from "./OrderDetails";

function OrderSuccessModal({ order, onClose }) {
  const { dialogRef, close, handleBackdropClick } = useDialog();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="order-success-title"
      className="modal"
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <div className="relative p-8">
        <button
          className="absolute top-3 right-3.5 p-1 text-ink-subtle hover:text-ink"
          type="button"
          onClick={close}
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
        <div className="mt-6 rounded-card border border-brand px-5 py-4 text-center">
          <p className="text-caption text-ink-muted">訂單編號</p>
          <p className="text-heading font-semibold tracking-wider text-brand">
            {order.order_number}
          </p>
          <p className="mt-1 text-caption text-ink-subtle">
            請記下訂單編號，匯款回報時會用到。
          </p>
        </div>

        <div className="mt-6">
          <OrderDetails order={order} />
        </div>
      </div>
    </dialog>
  );
}

export default OrderSuccessModal;
