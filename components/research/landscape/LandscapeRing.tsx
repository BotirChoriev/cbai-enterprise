import type { LandscapeObject } from "@/lib/research/landscape/landscape-types";
import { LANDSCAPE_RING_LABELS, type LandscapeRingId } from "@/lib/research/landscape/landscape-types";
import LandscapeObjectCard from "@/components/research/landscape/LandscapeObjectCard";

type LandscapeRingProps = {
  ringId: LandscapeRingId;
  title?: string;
  objects: readonly LandscapeObject[];
  compact?: boolean;
  onSelectTopic?: (topicId: string) => void;
};

export default function LandscapeRing({
  ringId,
  title,
  objects,
  compact = false,
  onSelectTopic,
}: LandscapeRingProps) {
  if (objects.length === 0) {
    return null;
  }

  const ringTitle = title ?? LANDSCAPE_RING_LABELS[ringId];

  return (
    <div className="relative space-y-3">
      {ringId !== "center" ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[85%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-500/10"
          aria-hidden="true"
        />
      ) : null}

      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
          {ringTitle}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 px-2">
        {objects.map((object) => (
          <LandscapeObjectCard
            key={object.objectId}
            object={object}
            compact={compact}
            onSelectTopic={onSelectTopic}
          />
        ))}
      </div>
    </div>
  );
}
