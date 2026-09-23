import { orderFormFields } from "../utils/orderForm";

const pickupMethodOptions = [
  { value: "超商自取", label: "超商自取" },
];

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
    </div>
  );
}

export default PickupMethodSelect;
