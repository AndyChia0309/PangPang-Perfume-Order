import { orderFormFields } from "../utils/orderForm";

const pickupMethodOptions = [{ value: "超商自取", label: "超商自取" }];

function PickupMethodSelect() {
  return (
    <div className="pickup-field">
      <label htmlFor="pickup-method" className="pickup-title">
        領取地點
      </label>

      <select name={orderFormFields.pickupMethod} id="pickup-method">
        {pickupMethodOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label htmlFor="pickup-store-address" className="pickup-title">
        取貨門市地址
      </label>

      <input
        type="text"
        id="pickup-store-address"
        name={orderFormFields.pickupStoreAddress}
        placeholder="請輸入取貨門市名稱或地址"
        required
      />
    </div>
  );
}

export default PickupMethodSelect;
