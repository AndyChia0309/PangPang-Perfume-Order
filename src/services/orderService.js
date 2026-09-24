export async function submitOrder(order) {
  const { getSupabase } = await import("../lib/supabaseClient");
  const { error } = await getSupabase().from("orders").insert(order);

  if (error) {
    throw error;
  }
}
