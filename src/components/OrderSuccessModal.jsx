function OrderSuccessModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-10 grid place-items-center p-5 bg-[var(--color-backdrop)]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] p-8 rounded-lg bg-[var(--color-surface)] shadow-[0_24px_80px_var(--color-panel-shadow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3.5 border-0 bg-transparent text-[28px] leading-none text-[var(--color-subtle)] hover:text-[var(--color-text)]"
          type="button"
          onClick={onClose}
          aria-label="關閉"
        >
          ×
        </button>

        <h2 className="mb-3 text-[var(--color-accent)]">訂單完成</h2>
        <p className="text-[var(--color-muted)] leading-[1.7]">
          訂單確認後，我們將在兩日內寄送訂單資訊給您，再麻煩至 Email 或 IG
          帳號查收訂單確認資訊及匯款資料。
        </p>
      </div>
    </div>
  );
}

export default OrderSuccessModal;
