// 每個步驟共用的標題區；titleAside 會放在標題右邊，與標題文字底部（基線）切齊
function StepHeader({ eyebrow, title, titleAside, description }) {
  return (
    <>
      {eyebrow && <p className="mb-2 text-eyebrow text-brand">{eyebrow}</p>}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-title font-semibold text-ink">{title}</h1>
        {titleAside}
      </div>
      <p className="mt-3 text-body text-ink-muted">{description}</p>
    </>
  );
}

export default StepHeader;
