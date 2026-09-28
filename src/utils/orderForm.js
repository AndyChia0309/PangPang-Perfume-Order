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
  pickupStoreAddress: "pickupStoreAddress",
  recipientName: "recipientName",
  recipientPhone: "recipientPhone",
  note: "note",
  privacyAgreed: "privacyAgreed",
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
  const pickupStoreAddress = getTextValue(
    formData,
    orderFormFields.pickupStoreAddress,
  );
  const recipientName = getTextValue(formData, orderFormFields.recipientName);
  const recipientPhone = getTextValue(formData, orderFormFields.recipientPhone);
  const note = getTextValue(formData, orderFormFields.note);
  const privacyAgreed = formData.get(orderFormFields.privacyAgreed) === "on";

  if (!customerName) {
    return { errorMessage: "請填寫姓名。" };
  }

  if (!phone) {
    return { errorMessage: "請填寫電話。" };
  }

  if (!email) {
    return { errorMessage: "請填寫Email。" };
  }

  if (!pickupStoreAddress) {
    return { errorMessage: "請填寫收件門市地址。" };
  }

  if (!privacyAgreed) {
    return { errorMessage: "請同意隱私權政策。" };
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
      pickup_store_address: pickupStoreAddress,
      recipient_name: recipientName || customerName,
      recipient_phone: recipientPhone || phone,
      note,
      privacy_agreed: privacyAgreed,
    },
  };
}
