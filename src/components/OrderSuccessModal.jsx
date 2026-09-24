import { useEffect, useRef } from "react";
import { X } from "lucide-react";

function OrderSuccessModal({ onClose }) {
  const dialogRef = useRef(null);

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
      className="m-auto w-[calc(100%-2rem)] max-w-[520px] rounded-card bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop:bg-black/40"
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
      </div>
    </dialog>
  );
}

export default OrderSuccessModal;
