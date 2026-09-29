import { useState, useRef } from "react";
import { submitOrder } from "../services/orderService";
import { createOrderFromFormData } from "../utils/orderForm";

export function useOrderSubmit({ onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pendingOrder, setPendingOrder] = useState(null);
  const formRef = useRef(null);

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

    formRef.current = form;
    setPendingOrder(order);
  }

  async function confirmSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await submitOrder(pendingOrder);
      formRef.current.reset();
      setPendingOrder(null);
      onSuccess(pendingOrder);
    } catch (error) {
      console.error("訂單送出失敗", error);
      setSubmitError("訂單送出失敗，請稍後再試，或透過 IG 與我們聯繫。");
      setPendingOrder(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function cancelConfirm() {
    setPendingOrder(null);
  }

  return {
    isSubmitting,
    submitError,
    pendingOrder,
    handleSubmit,
    confirmSubmit,
    cancelConfirm,
  };
}
