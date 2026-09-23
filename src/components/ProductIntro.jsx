import ProductInfo from "./ProductInfo";

function ProductIntro({ characterImage, characterImageAlt }) {
  return (
    <div className="product-intro">
      <div className="product-intro-copy">
        <ProductInfo />
      </div>

      <div className="intro-product-media">
        <img
          className="intro-product-image"
          src={characterImage}
          alt={characterImageAlt}
        />
      </div>
    </div>
  );
}

export default ProductIntro;
