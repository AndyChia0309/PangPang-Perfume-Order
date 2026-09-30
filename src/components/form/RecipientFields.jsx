import { orderFormFields, textFieldRules } from "../../../shared/orderForm";
import PickupMethodSelect from "./PickupMethodSelect";
import RequiredMark from "./RequiredMark";

const recipientFields = [
  {
    id: "recipient-name",
    label: "收件人姓名",
    type: "text",
    name: orderFormFields.recipientName,
    maxLength: textFieldRules.recipientName.maxLength,
    placeholder: "空白則同訂購人",
  },
  {
    id: "recipient-phone",
    label: "收件人電話",
    type: "tel",
    name: orderFormFields.recipientPhone,
    maxLength: textFieldRules.recipientPhone.maxLength,
    inputMode: "tel",
    placeholder: "空白則同訂購人",
  },
];

function RecipientFields() {
  return (
    <section
      aria-labelledby="recipient-title"
      className="card grid gap-6 p-4 sm:p-5 lg:grid-cols-2 lg:gap-x-6"
    >
      <h2 id="recipient-title" className="field-label lg:col-span-2">
        收件資訊
      </h2>

      {recipientFields.map(({ label, ...inputProps }) => (
        <div className="flex flex-col gap-2" key={inputProps.name}>
          <label htmlFor={inputProps.id} className="field-label">
            {label}
          </label>
          <input {...inputProps} className="field" />
        </div>
      ))}

      <PickupMethodSelect />

      <div className="flex flex-col gap-2 lg:col-span-2">
        <label htmlFor="order-note" className="field-label">
          備註
        </label>
        <textarea
          id="order-note"
          className="field resize-y"
          name={orderFormFields.note}
          placeholder="請輸入備註"
          rows={3}
          maxLength={textFieldRules.note.maxLength}
        />
      </div>

      <div className="flex items-start gap-3 lg:col-span-2">
        <input
          id="privacy-policy"
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand"
          type="checkbox"
          name={orderFormFields.privacyAgreed}
          required
        />
        <label
          htmlFor="privacy-policy"
          className="cursor-pointer text-caption text-ink-muted"
        >
          我同意香水夢遊蒐集並使用以上個人資料，僅用於本次訂單處理、出貨與聯繫，並於下單 30 天後刪除。
          <RequiredMark />
        </label>
      </div>
    </section>
  );
}

export default RecipientFields;
