import { orderFormFields } from "../utils/orderForm";

const customerFields = [
  {
    id: "customer-name",
    label: "訂購人姓名",
    type: "text",
    name: orderFormFields.customerName,
    autoComplete: "name",
    placeholder: "請輸入姓名",
    required: true,
  },
  {
    id: "customer-phone",
    label: "電話",
    type: "tel",
    name: orderFormFields.phone,
    autoComplete: "tel",
    inputMode: "tel",
    placeholder: "請輸入電話號碼",
    required: true,
  },
  {
    id: "customer-email",
    label: "Email",
    type: "email",
    name: orderFormFields.email,
    autoComplete: "email",
    placeholder: "請輸入電子郵件",
    required: true,
  },
  {
    id: "customer-instagram",
    label: "IG 帳號",
    type: "text",
    name: orderFormFields.instagram,
    autoComplete: "username",
    placeholder: "請輸入IG帳號",
  },
];

function CustomerFields() {
  return (
    <>
      {customerFields.map(({ label, ...inputProps }) => (
        <div className="flex flex-col gap-2" key={inputProps.name}>
          <label htmlFor={inputProps.id} className="field-label">
            {label}
          </label>
          <input
            {...inputProps}
            className="field"
          />
        </div>
      ))}
    </>
  );
}

export default CustomerFields;
