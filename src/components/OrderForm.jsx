import { useState } from "react";
import SiteHeader from "./SiteHeader";
import StepBrandIntro from "./steps/StepBrandIntro";
import StepOrder from "./steps/StepOrder";
import StepScent from "./steps/StepScent";
import StepVideo from "./steps/StepVideo";
import WizardFooter from "./WizardFooter";
import { useOrderSubmit } from "../hooks/useOrderSubmit";
import ConfirmOrderModal from "./ConfirmOrderModal";

const INTRO_STEPS = [
  { Component: StepBrandIntro, nextLabel: "繼續" },
  { Component: StepVideo, nextLabel: "繼續" },
  { Component: StepScent, nextLabel: "前往購買" },
];

const TOTAL_STEPS = INTRO_STEPS.length + 1;

function OrderForm({ onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSmallQuantity, setSelectedSmallQuantity] = useState("0");
  const [selectedLargeQuantity, setSelectedLargeQuantity] = useState("0");
  const [smallOtherQuantity, setSmallOtherQuantity] = useState("");
  const [largeOtherQuantity, setLargeOtherQuantity] = useState("");

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(1, step - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToNextStep() {
    setCurrentStep((step) => Math.min(TOTAL_STEPS, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const {
    isSubmitting,
    submitError,
    pendingOrder,
    handleSubmit,
    confirmSubmit,
    cancelConfirm,
  } = useOrderSubmit({
    onSuccess(order) {
      setSelectedSmallQuantity("0");
      setSelectedLargeQuantity("0");
      setSmallOtherQuantity("");
      setLargeOtherQuantity("");
      setCurrentStep(1);
      onSuccess(order);
    },
  });

  const introStep = INTRO_STEPS[currentStep - 1];
  const isOrderStep = currentStep === TOTAL_STEPS;

  return (
    <>
      <form className="flex min-h-dvh flex-col" onSubmit={handleSubmit}>
        <SiteHeader />
        <div className="page-gutter flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-content py-6 md:py-10 lg:py-14">
            {introStep && <introStep.Component />}

            {/* 訂購表單保持掛載、只用 hidden 隱藏，返回上一步再回來時已填的欄位才不會被清空 */}
            <div hidden={!isOrderStep}>
              <StepOrder
                selectedSmallQuantity={selectedSmallQuantity}
                onSmallQuantityChange={setSelectedSmallQuantity}
                smallOtherQuantity={smallOtherQuantity}
                onSmallOtherQuantityChange={setSmallOtherQuantity}
                selectedLargeQuantity={selectedLargeQuantity}
                onLargeQuantityChange={setSelectedLargeQuantity}
                largeOtherQuantity={largeOtherQuantity}
                onLargeOtherQuantityChange={setLargeOtherQuantity}
                submitError={submitError}
              />
            </div>
          </div>
        </div>

        <WizardFooter
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onBack={goToPreviousStep}
          onContinue={goToNextStep}
          isSubmitting={isSubmitting}
          continueLabel={introStep?.nextLabel}
        />
      </form>

      {pendingOrder && (
        <ConfirmOrderModal
          order={pendingOrder}
          isSubmitting={isSubmitting}
          onConfirm={confirmSubmit}
          onCancel={cancelConfirm}
        />
      )}
    </>
  );
}

export default OrderForm;
