import { createOrderFromFormData } from "../src/utils/orderForm.js";
import { calculateOrderTotal } from "../src/utils/orderTotal.js";

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function createOrderNumber() {
  const taiwanNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const date = taiwanNow.toISOString().slice(2, 10).replaceAll("-", "");

  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const code = Array.from(
    bytes,
    (byte) => CODE_CHARS[byte % CODE_CHARS.length],
  ).join("");

  return `PP${date}-${code}`;
}

export async function handleCreateOrder(request, env) {
  let formData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "資料格式錯誤。" }, { status: 400 });
  }

  const { order, errorMessage } = createOrderFromFormData(formData);

  if (errorMessage) {
    return Response.json({ error: errorMessage }, { status: 400 });
  }

  const { subtotal, shippingFee, total } = calculateOrderTotal(
    order.small_qty,
    order.large_qty,
  );

  const row = {
    ...order,
    order_number: createOrderNumber(),
    subtotal,
    shipping_fee: shippingFee,
    total,
  };

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    console.error("Supabase 寫入失敗", response.status, await response.text());
    return Response.json(
      { error: "訂單送出失敗，請稍後再試。" },
      { status: 500 },
    );
  }

  return Response.json(
    { orderNumber: row.order_number, subtotal, shippingFee, total },
    { status: 201 },
  );
}
