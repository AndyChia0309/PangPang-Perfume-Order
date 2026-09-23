import { orderFormFields } from "../utils/orderForm";
import QuantitySelector from "./QuantitySelector";

function OrderQuantityFields({
  selectedSmallQuantity,
  selectedLargeQuantity,
  onSmallQuantityChange,
  onLargeQuantityChange,
}) {
  const quantityFields = [
    {
      key: "small",
      title: "請選擇小瓶香水（1 mL）購買數量",
      fieldName: orderFormFields.smallQuantity,
      otherFieldName: orderFormFields.smallQuantityOther,
      value: selectedSmallQuantity,
      onChange: onSmallQuantityChange,
    },
    {
      key: "large",
      title: "請選擇大瓶香水（7 mL）購買數量",
      fieldName: orderFormFields.largeQuantity,
      otherFieldName: orderFormFields.largeQuantityOther,
      value: selectedLargeQuantity,
      onChange: onLargeQuantityChange,
    },
  ];

  return (
    <>
      {quantityFields.map(({ key, ...field }) => (
        <QuantitySelector key={key} {...field} />
      ))}
    </>
  );
}

export default OrderQuantityFields;
