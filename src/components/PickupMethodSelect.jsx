import { ChevronDown } from "lucide-react";
import { orderFormFields } from "../utils/orderForm";

const pickupMethodOptions = ["超商自取"];

function PickupMethodSelect() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="pickup-method" className="field-label">
          取貨方式
        </label>

        <div className="relative">
          <select
            name={orderFormFields.pickupMethod}
            id="pickup-method"
            className="field cursor-pointer appearance-none pr-11"
          >
            {pickupMethodOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-brand"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="pickup-store-address" className="field-label">
          取貨門市地址
        </label>

        <input
          type="text"
          id="pickup-store-address"
          name={orderFormFields.pickupStoreAddress}
          placeholder="請輸入取貨門市名稱或地址"
          required
          className="field"
        />
      </div>
    </>
  );
}

export default PickupMethodSelect;
