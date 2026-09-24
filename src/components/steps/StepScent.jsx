import { productMedia } from "../../data/productMedia";
import ProductGallery from "../ProductGallery";
import ProductInfo from "../ProductInfo";
import StepHeader from "./StepHeader";

function StepScent() {
  const { character, galleryImages } = productMedia;

  return (
    <div>
      <StepHeader
        title="認識這瓶香水的味道"
        description="從前調到後調，是 Colleen 從慵懶到找回自信的一段旅程。"
      />

      {/* Colleen 在任何寬度都固定在介紹文字右邊，窄螢幕時縮小圖片欄位 */}
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] gap-4 md:grid-cols-2 md:gap-8">
        <ProductInfo />

        <div className="relative overflow-hidden rounded-card">
          <img
            className="absolute inset-0 h-full w-full object-contain"
            src={character.src}
            alt={character.alt}
            decoding="async"
          />
        </div>
      </div>

      <div className="mt-8">
        <ProductGallery images={galleryImages} />
      </div>
    </div>
  );
}

export default StepScent;
