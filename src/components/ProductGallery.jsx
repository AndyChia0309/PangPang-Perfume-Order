import { useState } from "react";

function ProductGallery({ images }) {
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const currentImage = images[galleryIndex];

  function showPreviousImage() {
    setGalleryIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  }

  function showNextImage() {
    setGalleryIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    );
  }

  return (
    <div className="product-gallery">
      <div
        className="gallery-stage"
        style={{
          "--gallery-ratio": `${currentImage.width} / ${currentImage.height}`,
        }}
      >
        <img
          className="gallery-image"
          src={currentImage.src}
          alt={currentImage.alt}
        />

        <button
          type="button"
          className="gallery-nav gallery-nav-prev"
          aria-label="上一張商品圖片"
          onClick={showPreviousImage}
        >
          {"<"}
        </button>

        <button
          type="button"
          className="gallery-nav gallery-nav-next"
          aria-label="下一張商品圖片"
          onClick={showNextImage}
        >
          {">"}
        </button>

        <div className="gallery-dots" aria-label="商品圖片切換">
          {images.map((image, index) => (
            <button
              type="button"
              className={`gallery-dot ${
                index === galleryIndex ? "is-active" : ""
              }`}
              key={image.src}
              aria-label={`切換到第 ${index + 1} 張商品圖片`}
              onClick={() => setGalleryIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductGallery;
