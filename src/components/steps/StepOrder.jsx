import { orderNotice } from "../../data/productContent";
import { orderFormFields } from "../../utils/orderForm";
import CustomerFields from "../CustomerFields";
import InstagramContact from "../InstagramContact";
import PickupMethodSelect from "../PickupMethodSelect";
import QuantitySelector from "../QuantitySelector";
import StepHeader from "./StepHeader";

function StepOrder({
  selectedSmallQuantity,
  selectedLargeQuantity,
  onSmallQuantityChange,
  onLargeQuantityChange,
  submitError,
}) {
  return (
    <div>
      <StepHeader
        title="填寫訂購資訊"
        description="最後一步，留下您的資料完成訂購。"
      />

      {/* 8 個欄位放在同一個 grid：手機依序排列，寬螢幕先填滿左欄 4 列再換右欄，左右每一列高度對齊 */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-4 sm:gap-x-8">
        <CustomerFields />
        <QuantitySelector
          title="請選擇小瓶香水（1 mL）購買數量"
          fieldName={orderFormFields.smallQuantity}
          otherFieldName={orderFormFields.smallQuantityOther}
          value={selectedSmallQuantity}
          onChange={onSmallQuantityChange}
        />
        <QuantitySelector
          title="請選擇大瓶香水（7 mL）購買數量"
          fieldName={orderFormFields.largeQuantity}
          otherFieldName={orderFormFields.largeQuantityOther}
          value={selectedLargeQuantity}
          onChange={onLargeQuantityChange}
        />
        <PickupMethodSelect />
      </div>

      <dl className="mt-8 grid gap-1 rounded-lg bg-brand-soft px-5 py-4 text-caption">
        {orderNotice.map(({ label, text }) => (
          <div key={label} className="flex gap-2">
            <dt className="shrink-0 font-semibold text-brand">{label}</dt>
            <dd className="text-ink-muted">{text}</dd>
          </div>
        ))}
      </dl>

      {submitError && (
        <p className="mt-6 text-caption text-danger">{submitError}</p>
      )}

      <div className="mt-8">
        <InstagramContact />
      </div>
    </div>
  );
}

export default StepOrder;
