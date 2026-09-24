import { X } from "lucide-react";

function OrderSuccessModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-10 flex justify-center overflow-y-auto bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-[520px] rounded-lg bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3.5 p-1 text-ink-subtle hover:text-ink"
          type="button"
          onClick={onClose}
          aria-label="關閉"
        >
          <X className="size-6" aria-hidden="true" />
        </button>

        <h2 className="mb-3 text-heading font-semibold text-brand">訂單完成</h2>
        <p className="text-body text-ink-muted">
          訂單確認後，我們將在兩日內寄送訂單資訊給您，再麻煩至 Email 或 IG
          帳號查收訂單確認資訊及匯款資料。
        </p>
      </div>
    </div>
  );
}

export default OrderSuccessModal;
