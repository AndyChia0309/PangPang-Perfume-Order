const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token, ip, env) {
  const allowedHostnames = (env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim())
    .filter(Boolean);

  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048 ||
    allowedHostnames.length === 0
  ) {
    return false;
  }

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET,
    response: token,
  });

  if (ip) body.set("remoteip", ip);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return false;

    const result = await response.json();

    return (
      result.success === true &&
      result.action === "order" &&
      allowedHostnames.includes(result.hostname)
    );
  } catch (error) {
    console.error("Turnstile 驗證失敗", error);
    return false;
  }
}

export async function hashToken(token) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
