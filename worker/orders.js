import { hashToken, verifyTurnstile } from "./turnstile.js";
import { createOrderFromFormData } from "../shared/orderForm.js";
import { calculateOrderTotal } from "../shared/orderTotal.js";

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

  const token = formData.get("cf-turnstile-response");
  const ip = request.headers.get("cf-connecting-ip");

  if (!(await verifyTurnstile(token, ip, env))) {
    return Response.json(
      { error: "人機驗證失敗，請稍候再試一次。" },
      { status: 403 },
    );
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
    turnstile_token_hash: await hashToken(token),
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
    const detail = await response.text();

    if (response.status === 409 && detail.includes("turnstile_token_hash")) {
      return Response.json(
        { error: "人機驗證失敗，請稍候再試一次。" },
        { status: 403 },
      );
    }

    console.error("Supabase 寫入失敗", response.status, detail);
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
