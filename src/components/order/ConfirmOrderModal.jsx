import { useDialog } from "../../hooks/useDialog";
import OrderDetails from "./OrderDetails";

function ConfirmOrderModal({ order, isSubmitting, onConfirm, onCancel }) {
  const { dialogRef, close, handleBackdropClick } = useDialog();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-order-title"
      className="modal"
      onClose={onCancel}
      onClick={handleBackdropClick}
    >
      <div className="p-8">
        <h2
          id="confirm-order-title"
          className="mb-3 text-heading font-semibold text-brand"
        >
          確認訂單內容
        </h2>
        <p className="text-body text-ink-muted">
          請確認以下資訊正確，送出後將無法修改。
        </p>

        <div className="mt-6">
          <OrderDetails order={order} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="btn btn-outline"
            type="button"
            onClick={close}
            disabled={isSubmitting}
          >
            返回修改
          </button>

          <button
            className="btn btn-primary"
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "送出中..." : "確認送出"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default ConfirmOrderModal;
