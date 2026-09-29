import { handleCreateOrder } from "./orders.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true });
    }

    if (url.pathname === "/api/orders") {
      if (request.method !== "POST") {
        return Response.json({ error: "Method Not Allowed" }, { status: 405 });
      }

      return handleCreateOrder(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};