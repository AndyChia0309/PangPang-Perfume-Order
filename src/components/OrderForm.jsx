import { useState } from "react";
import brandLogo from "../assets/images/logo.svg";
import { submitOrder } from "../services/orderService";
import { createOrderFromFormData } from "../utils/orderForm";
import InstagramContact from "./InstagramContact";
import StepBrandIntro from "./steps/StepBrandIntro";
import StepOrder from "./steps/StepOrder";
import StepScent from "./steps/StepScent";
import StepVideo from "./steps/StepVideo";
import WizardFooter from "./WizardFooter";

const TOTAL_STEPS = 4;

function OrderForm({ onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedSmallQuantity, setSelectedSmallQuantity] = useState("0");
  const [selectedLargeQuantity, setSelectedLargeQuantity] = useState("0");

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(1, step - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToNextStep() {
    setCurrentStep((step) => Math.min(TOTAL_STEPS, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
      setCurrentStep(1);
      onSuccess();
    } catch (error) {
      console.error("訂單送出失敗", error);
      setSubmitError("訂單送出失敗，請稍後再試，或透過 IG 與我們聯繫。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="flex min-h-dvh flex-col"
      onSubmit={handleSubmit}
    >
      <header className="page-gutter flex items-center justify-between gap-4 py-4">
        <img
          className="h-8 w-auto lg:h-10 2xl:h-12"
          src={brandLogo}
          alt="香水夢遊 Parfum Tournée"
          width={256}
          height={226}
        />
        <InstagramContact />
      </header>

      <div className="page-gutter flex flex-1 flex-col justify-center">
        <div className="mx-auto w-full max-w-content py-6 md:py-10 lg:py-14">
          {currentStep === 1 && <StepBrandIntro />}

          {currentStep === 2 && <StepVideo />}

          {currentStep === 3 && <StepScent />}

          {currentStep === 4 && (
            <StepOrder
              selectedSmallQuantity={selectedSmallQuantity}
              selectedLargeQuantity={selectedLargeQuantity}
              onSmallQuantityChange={setSelectedSmallQuantity}
              onLargeQuantityChange={setSelectedLargeQuantity}
              submitError={submitError}
            />
          )}
        </div>
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onBack={goToPreviousStep}
        onContinue={goToNextStep}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export default OrderForm;
