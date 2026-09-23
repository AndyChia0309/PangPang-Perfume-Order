import { supabase } from "../lib/supabaseClient";

export async function submitOrder(order) {
  const { error } = await supabase.from("orders").insert(order);

  if (error) {
    throw error;
  }
}
