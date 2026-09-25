import { useState } from "react";
import { submitOrder } from "../services/orderService";
import { createOrderFromFormData } from "../utils/orderForm";

export function useOrderSubmit({ onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const { order, errorMessage } = createOrderFromFormData(formData);

    if (errorMessage) {
      setSubmitError(errorMessage);
      setIsSubmitting(false);
      return;
    }

    try {
      await submitOrder(order);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("訂單送出失敗", error);
      setSubmitError("訂單送出失敗，請稍後再試，或透過 IG 與我們聯繫。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, submitError, handleSubmit };
}
