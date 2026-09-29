import { useState, useRef } from "react";
import { submitOrder } from "../services/orderService";
import { createOrderFromFormData } from "../../shared/orderForm";

export function useOrderSubmit({ onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pendingOrder, setPendingOrder] = useState(null);
  const formRef = useRef(null);
  const formDataRef = useRef(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const { order, errorMessage } = createOrderFromFormData(formData);

    if (errorMessage) {
      setSubmitError(errorMessage);
      return;
    }

    if (!formData.get("cf-turnstile-response")) {
      setSubmitError("正在確認您不是機器人，請稍候再按一次。");
      return;
    }

    formRef.current = form;
    formDataRef.current = formData;
    setPendingOrder(order);
  }

  async function confirmSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { orderNumber } = await submitOrder(formDataRef.current);
      formRef.current.reset();
      setPendingOrder(null);
      onSuccess({ ...pendingOrder, order_number: orderNumber });
    } catch (error) {
      console.error("訂單送出失敗", error);
      setSubmitError(
        [403, 429].includes(error.status)
          ? error.message
          : "訂單送出失敗，請稍後再試，或透過 IG 與我們聯繫。",
      );
      setPendingOrder(null);
    } finally {
      setIsSubmitting(false);
      setTurnstileKey((key) => key + 1);
    }
  }

  function cancelConfirm() {
    setPendingOrder(null);
  }

  return {
    isSubmitting,
    submitError,
    pendingOrder,
    turnstileKey,
    handleSubmit,
    confirmSubmit,
    cancelConfirm,
  };
}
