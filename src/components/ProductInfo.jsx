import { productContent } from "../data/productContent";

const detailClassNames = {
  scent: "text-body font-medium text-brand",
  note: "max-w-[34ch] break-words text-caption text-ink-subtle",
  default: "text-body text-ink-muted",
};

function ProductInfo() {
  return (
    <div>
      <h1 className="mb-4 text-heading font-semibold text-brand">
        {productContent.title}
      </h1>

      <div>
        {productContent.details.map((detail, index) =>
          detail.type === "space" ? (
            <div key={`space-${index}`} className="h-5" />
          ) : (
            <p
              className={detailClassNames[detail.variant ?? "default"]}
              key={detail.text}
            >
              {detail.text}
            </p>
          ),
        )}
      </div>
    </div>
  );
}

export default ProductInfo;
