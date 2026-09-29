export async function submitOrder(formData) {
  const response = await fetch("/api/orders", {
    method: "POST",
    body: formData,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return result;
}
