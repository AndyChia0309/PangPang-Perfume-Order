import { ChevronRight } from "lucide-react";
import { brandStory } from "../../data/brandStory";
import StepHeader from "./StepHeader";

function StepVideo() {
  return (
    <div>
      <StepHeader
        title="了解更多香水夢遊的故事"
        description="一場結合擴增實境與香氣的沉浸式體驗，點開影片，先感受這趟旅程。"
      />

      <div className="mt-8 aspect-video w-full overflow-hidden rounded-card bg-black">
        <iframe
          className="h-full w-full"
          src={brandStory.videoEmbedUrl}
          title="香水夢遊 Parfum Tournée 影片"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="mt-6 grid gap-3 text-body text-ink-muted">
        {brandStory.videoDescription.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <a
        className="mt-6 inline-flex items-center gap-1 text-caption font-semibold text-brand transition-colors duration-200 hover:text-brand-dark"
        href={brandStory.videoUrl}
        target="_blank"
        rel="noreferrer"
      >
        看更多幕後花絮影片
        <ChevronRight className="size-4" aria-hidden="true" />
      </a>
    </div>
  );
}

export default StepVideo;
