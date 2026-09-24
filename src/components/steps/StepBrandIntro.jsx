import { brandStory } from "../../data/brandStory";
import { productMedia } from "../../data/productMedia";
import StepHeader from "./StepHeader";

function StepBrandIntro() {
  const { hero } = productMedia;

  return (
    <div>
      <StepHeader
        eyebrow="PARFUM TOURNEE"
        title={brandStory.title}
        description="認識我們的品牌故事，再開始這趟訂購旅程。"
      >
        <div className="mt-3 flex items-center gap-4 text-caption font-semibold tracking-label text-brand">
          <span>{brandStory.notes[0]}</span>
          <span className="text-ink-subtle">X</span>
          <span>{brandStory.notes[1]}</span>
        </div>
      </StepHeader>

      <img
        className="mt-8 w-full rounded-xl object-cover"
        src={hero.src}
        alt={hero.alt}
        width={hero.width}
        height={hero.height}
        fetchPriority="high"
      />

      <div className="mt-8 grid gap-3 text-body text-ink-muted">
        <p>{brandStory.description}</p>
        <p>{brandStory.productDescription}</p>
        <p>{brandStory.background}</p>
      </div>
    </div>
  );
}

export default StepBrandIntro;
