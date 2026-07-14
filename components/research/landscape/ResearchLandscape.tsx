import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchLandscapeForTopic } from "@/lib/research/landscape/landscape-query";
import {
  getLandscapeFirstRing,
  getLandscapeSecondRing,
  getLandscapeThirdRing,
} from "@/lib/research/landscape/landscape-builder";
import {
  LANDSCAPE_HONEST_NOTICE,
  LANDSCAPE_HUMAN_REVIEW_NOTICE,
} from "@/lib/research/landscape/landscape-types";
import LandscapeCenter from "@/components/research/landscape/LandscapeCenter";
import LandscapeRing from "@/components/research/landscape/LandscapeRing";
import LandscapeLegend from "@/components/research/landscape/LandscapeLegend";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchLandscapeProps = {
  topic: ResearchTopic;
  variant?: "topic" | "workspace";
  onSelectTopic?: (topicId: string) => void;
  embedded?: boolean;
};

export default function ResearchLandscape({
  topic,
  variant = "topic",
  onSelectTopic,
  embedded = false,
}: ResearchLandscapeProps) {
  const landscape = getResearchLandscapeForTopic(topic);
  const compact = variant === "workspace";
  const headingId =
    variant === "topic" ? "topic-research-landscape-heading" : "workspace-research-landscape-heading";

  return (
    <section aria-labelledby={headingId} className="space-y-5">
      <div className="space-y-2 text-center sm:text-left">
        <p className={cbaiSectionEyebrow}>Knowledge landscape</p>
        <h2 id={headingId} className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
          Research Landscape
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-zinc-500 sm:mx-0">
          One integrated view of catalog methods, evidence areas, related research objects, research
          gaps, and future workspace connections.
        </p>
        {!embedded ? (
          <p className="mx-auto max-w-2xl rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-500 sm:mx-0">
            {LANDSCAPE_HONEST_NOTICE}
          </p>
        ) : null}
      </div>

      <div className={`${cbaiGlassCard} relative overflow-hidden p-4 sm:p-6`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_65%)]"
          aria-hidden="true"
        />

        <div className="relative space-y-8">
          <LandscapeCenter centerTopic={landscape.centerTopic} compact={compact} />

          <LandscapeRing
            ringId="first"
            title="Evidence areas"
            objects={getLandscapeFirstRing(landscape)}
            compact={compact}
          />

          <LandscapeRing
            ringId="second"
            title="Related research objects"
            objects={getLandscapeSecondRing(landscape)}
            compact={compact}
            onSelectTopic={variant === "workspace" ? onSelectTopic : undefined}
          />

          <LandscapeRing
            ringId="third"
            title="Future workspace"
            objects={getLandscapeThirdRing(landscape)}
            compact={compact}
          />
        </div>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <LandscapeLegend />
        {!embedded ? (
          <p className="text-center text-[11px] text-zinc-600 sm:text-left">
            {LANDSCAPE_HUMAN_REVIEW_NOTICE}
          </p>
        ) : null}
      </div>
    </section>
  );
}
