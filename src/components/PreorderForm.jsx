import { useState } from "react";
import { submitOrder } from "../services/orderService";
import { createOrderFromFormData } from "../utils/orderForm";
import CustomerFields from "./CustomerFields";
import InstagramContact from "./InstagramContact";
import OrderQuantityFields from "./OrderQuantityFields";
import PickupMethodSelect from "./PickupMethodSelect";
import ProductGallery from "./ProductGallery";
import ProductIntro from "./ProductIntro";

function PreorderForm({
  characterImage,
  characterImageAlt,
  galleryImages,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedSmallQuantity, setSelectedSmallQuantity] = useState("0");
  const [selectedLargeQuantity, setSelectedLargeQuantity] = useState("0");

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
      console.log("訂單送出成功");
      form.reset();
      setSelectedSmallQuantity("0");
      setSelectedLargeQuantity("0");
      onSuccess();
    } catch (error) {
      console.error("訂單送出失敗", error);
      setSubmitError("訂單送出失敗，請稍後再試，或透過 IG 與我們聯繫。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="preorder-form" onSubmit={handleSubmit}>
      <div className="form-layout">
        <div className="form-main">
          <ProductIntro
            characterImage={characterImage}
            characterImageAlt={characterImageAlt}
          />

          <ProductGallery images={galleryImages} />
        </div>

        <div className="form-side">
          <CustomerFields />

          <OrderQuantityFields
            selectedSmallQuantity={selectedSmallQuantity}
            selectedLargeQuantity={selectedLargeQuantity}
            onSmallQuantityChange={setSelectedSmallQuantity}
            onLargeQuantityChange={setSelectedLargeQuantity}
          />

          <PickupMethodSelect />
        </div>
      </div>

      <div className="form-footer">
        {submitError && <p className="form-error">{submitError}</p>}

        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送出中..." : "送出訂單"}
        </button>

        <InstagramContact />
      </div>
    </form>
  );
}

export default PreorderForm;
