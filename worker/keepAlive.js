export async function keepSupabaseAlive(env) {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/orders?select=id&limit=1`,
    {
      headers: { apikey: env.SUPABASE_SECRET_KEY },
    },
  );

  if (!response.ok) {
    console.error("Supabase keep-alive 失敗", response.status);
    return;
  }

  console.log("Supabase keep-alive 成功");
}
