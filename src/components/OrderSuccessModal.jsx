function OrderSuccessModal({ onClose }) {
  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="關閉"
        >
          ×
        </button>

        <h2>訂單完成</h2>
        <p>
          訂單確認後，我們將在兩日內寄送訂單資訊給您，再麻煩至 Email 或 IG
          帳號查收訂單確認資訊及匯款資料。
        </p>
      </div>
    </div>
  );
}

export default OrderSuccessModal;
