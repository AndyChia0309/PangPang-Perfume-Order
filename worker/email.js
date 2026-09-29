import { PRODUCTS } from "../shared/pricing.js";

const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";

function formatItems(order) {
  return [
    { product: PRODUCTS.small, qty: order.small_qty },
    { product: PRODUCTS.large, qty: order.large_qty },
  ]
    .filter((item) => item.qty > 0)
    .map(({ product, qty }) => `${product.name} × ${qty}`)
    .join("、");
}

async function sendEmail(env, templateId, templateParams) {
  const response = await fetch(EMAILJS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "pangpang-order-worker/1.0",
    },
    body: JSON.stringify({
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: env.EMAILJS_PUBLIC_KEY,
      accessToken: env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    throw new Error(`EmailJS ${response.status}：${await response.text()}`);
  }
}

export async function sendOrderEmails(env, order) {
  const templateParams = {
    to_email: order.email,
    order_number: order.order_number,
    customer_name: order.customer_name,
    phone: order.phone,
    instagram: order.instagram || "（未填寫）",
    items: formatItems(order),
    subtotal: order.subtotal,
    shipping_fee: order.shipping_fee,
    total: order.total,
    recipient_name: order.recipient_name,
    recipient_phone: order.recipient_phone,
    pickup_method: order.pickup_method,
    pickup_store_address: order.pickup_store_address,
    note: order.note || "（無）",
  };

  const templateIds = [
    env.EMAILJS_CUSTOMER_TEMPLATE_ID,
    env.EMAILJS_OWNER_TEMPLATE_ID,
  ];

  for (const [index, templateId] of templateIds.entries()) {
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await sendEmail(env, templateId, templateParams);
    } catch (error) {
      console.error("寄信失敗", templateId, error);
    }
  }
}
