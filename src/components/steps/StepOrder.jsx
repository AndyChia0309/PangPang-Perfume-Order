import TurnstileWidget from "../form/TurnstileWidget";
import { orderNotice } from "../../data/productContent";
import { orderFormFields } from "../../../shared/orderForm";
import CustomerFields from "../form/CustomerFields";
import QuantitySelector from "../form/QuantitySelector";
import StepHeader from "./StepHeader";
import OrderSummary from "../order/OrderSummary";
import { toQuantity } from "../../../shared/orderTotal";
import RecipientFields from "../form/RecipientFields";

function StepOrder({
  selectedSmallQuantity,
  selectedLargeQuantity,
  onSmallQuantityChange,
  onLargeQuantityChange,
  smallOtherQuantity,
  largeOtherQuantity,
  onSmallOtherQuantityChange,
  onLargeOtherQuantityChange,
  submitError,
  isActive,
  turnstileKey,
}) {
  const smallQty = toQuantity(selectedSmallQuantity, smallOtherQuantity);
  const largeQty = toQuantity(selectedLargeQuantity, largeOtherQuantity);

  return (
    <div>
      <StepHeader
        title="填寫訂購資訊"
        description="最後一步，留下您的資料完成訂購。標有 * 的欄位為必填。"
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="flex flex-col gap-6">
          <div className="card grid grid-cols-1 gap-6 p-4 sm:p-5 lg:grid-cols-2 lg:gap-x-6">
            <CustomerFields />
            <QuantitySelector
              title="請選擇小瓶香水（1 mL）購買數量"
              fieldName={orderFormFields.smallQuantity}
              otherFieldName={orderFormFields.smallQuantityOther}
              value={selectedSmallQuantity}
              onChange={onSmallQuantityChange}
              otherValue={smallOtherQuantity}
              onOtherChange={onSmallOtherQuantityChange}
            />
            <QuantitySelector
              title="請選擇大瓶香水（7 mL）購買數量"
              fieldName={orderFormFields.largeQuantity}
              otherFieldName={orderFormFields.largeQuantityOther}
              value={selectedLargeQuantity}
              onChange={onLargeQuantityChange}
              otherValue={largeOtherQuantity}
              onOtherChange={onLargeOtherQuantityChange}
            />
          </div>
          <RecipientFields />
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
          <OrderSummary smallQty={smallQty} largeQty={largeQty} />

          <dl className="grid gap-1 rounded-card bg-brand-soft px-5 py-4 text-caption">
            {orderNotice.map(({ label, text }) => (
              <div key={label} className="flex gap-2">
                <dt className="shrink-0 font-semibold text-brand">{label}</dt>
                <dd className="text-ink-muted">{text}</dd>
              </div>
            ))}
          </dl>

          {isActive && <TurnstileWidget key={turnstileKey} />}

          {submitError && (
            <p className="text-caption text-danger">{submitError}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

export default StepOrder;
