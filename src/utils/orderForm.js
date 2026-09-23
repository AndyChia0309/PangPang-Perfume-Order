export const orderFormFields = {
  customerName: "customerName",
  phone: "phone",
  email: "email",
  instagram: "instagram",
  smallQuantity: "smallQuantity",
  smallQuantityOther: "smallQuantityOther",
  largeQuantity: "largeQuantity",
  largeQuantityOther: "largeQuantityOther",
  pickupMethod: "pickupMethod",
};

function getTextValue(formData, fieldName) {
  return String(formData.get(fieldName) || "").trim();
}

function getQuantityValue(formData, quantityFieldName, otherQuantityFieldName) {
  const quantityValue = formData.get(quantityFieldName);

  if (quantityValue === "other") {
    return Number(formData.get(otherQuantityFieldName));
  }

  return Number(quantityValue);
}

export function createOrderFromFormData(formData) {
  const smallQty = getQuantityValue(
    formData,
    orderFormFields.smallQuantity,
    orderFormFields.smallQuantityOther,
  );

  const largeQty = getQuantityValue(
    formData,
    orderFormFields.largeQuantity,
    orderFormFields.largeQuantityOther,
  );

  if (!Number.isInteger(smallQty) || !Number.isInteger(largeQty)) {
    return { errorMessage: "請輸入正確的商品數量。" };
  }

  if (smallQty < 0 || largeQty < 0) {
    return { errorMessage: "商品數量不能小於 0。" };
  }

  if (smallQty === 0 && largeQty === 0) {
    return { errorMessage: "請至少選擇一項商品數量。" };
  }

  const customerName = getTextValue(formData, orderFormFields.customerName);
  const phone = getTextValue(formData, orderFormFields.phone);
  const email = getTextValue(formData, orderFormFields.email);
  const instagram = getTextValue(formData, orderFormFields.instagram);

  if (!customerName || !phone || !email) {
    return { errorMessage: "請填寫姓名、電話與 Email。" };
  }

  return {
    order: {
      customer_name: customerName,
      phone,
      email,
      instagram,
      small_qty: smallQty,
      large_qty: largeQty,
      pickup_method: formData.get(orderFormFields.pickupMethod),
    },
  };
}
