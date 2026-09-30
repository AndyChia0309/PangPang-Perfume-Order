import { handleCreateOrder } from "./orders.js";

async function route(request, env, ctx) {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return Response.json({ ok: true });
  }

  if (url.pathname === "/api/orders") {
    if (request.method !== "POST") {
      return Response.json({ error: "Method Not Allowed" }, { status: 405 });
    }

    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    const { success } = await env.ORDER_RATE_LIMITER.limit({ key: ip });

    if (!success) {
      return Response.json(
        { error: "送出太頻繁，請稍後再試。" },
        { status: 429 },
      );
    }

    return handleCreateOrder(request, env, ctx);
  }

  return new Response("Not Found", { status: 404 });
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cache-Control", "no-store");

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const response = await route(request, env, ctx);
    return withSecurityHeaders(response);
  },
};
