import { ChevronLeft, ChevronRight } from "lucide-react";

function WizardFooter({
  currentStep,
  totalSteps,
  onBack,
  onContinue,
  isSubmitting,
}) {
  const isLastStep = currentStep === totalSteps;
  // 進入訂購表單前的那一步，按鈕文案改為「前往購買」
  const continueLabel = currentStep === totalSteps - 1 ? "前往購買" : "繼續";
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <footer className="sticky bottom-0 z-10 bg-white">
      <div className="h-1 w-full bg-line">
        <div
          className="h-1 bg-brand transition-[width] duration-300 ease-in-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="page-gutter flex items-center justify-between py-4">
        {currentStep > 1 ? (
          <button
            className="btn btn-outline"
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
            返回
          </button>
        ) : (
          <span />
        )}

        {/* 不同 key 讓「繼續」與「送出」成為不同元素，避免點擊「繼續」後按鈕立即變成 submit 而誤送出表單 */}
        {isLastStep ? (
          <button
            key="submit"
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "送出中..." : "送出訂單"}
          </button>
        ) : (
          <button
            key="continue"
            className="btn btn-primary"
            type="button"
            onClick={onContinue}
          >
            {continueLabel}
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </footer>
  );
}

export default WizardFooter;
