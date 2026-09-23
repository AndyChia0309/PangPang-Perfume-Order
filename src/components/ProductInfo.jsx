import { productContent } from "../data/productContent";

function ProductInfo() {
  return (
    <>
      <h1>{productContent.title}</h1>

      <div className="product-details">
        {productContent.details.map((detail, index) =>
          detail.type === "space" ? (
            <div key={`space-${index}`} className="product-detail-space" />
          ) : (
            <p
              className={
                detail.variant === "note" ? "product-detail-note" : ""
              }
              key={detail.text}
            >
              {detail.text}
            </p>
          ),
        )}
      </div>
    </>
  );
}

export default ProductInfo;
