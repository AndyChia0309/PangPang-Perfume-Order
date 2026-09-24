// 每個步驟共用的標題區；children 會放在標題與說明文字之間
function StepHeader({ eyebrow, title, description, children }) {
  return (
    <>
      {eyebrow && <p className="mb-2 text-eyebrow text-brand">{eyebrow}</p>}
      <h1 className="text-title font-semibold text-ink">{title}</h1>
      {children}
      <p className="mt-3 text-body text-ink-muted">{description}</p>
    </>
  );
}

export default StepHeader;
