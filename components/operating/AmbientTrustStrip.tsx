"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";

/** Ambient trust — confidence and limitations without opening Trust page. */
export default function AmbientTrustStrip() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const disclosure = useProgressiveDisclosure();
  const { evidencePulse, humanImpact } = useMissionContext();

  if (!hydrated || !evidencePulse || !disclosure.showAmbientTrustStrip) return null;

  const confidence =
    evidencePulse.state === "available" && evidencePulse.consensus === "aligned"
      ? t("evidenceRuntime.consensusAligned")
      : evidencePulse.state === "conflicting"
        ? t("evidenceRuntime.consensusConflicted")
        : evidencePulse.count > 0
          ? t("evidenceRuntime.consensusPartial")
          : t("evidenceRuntime.consensusNone");

  const review =
    humanImpact?.isComplete
      ? t("missionCenter.impactComplete")
      : t("missionCenter.impactIncomplete");

  return (
    <div
      className="cbai-ambient-trust flex shrink-0 flex-wrap gap-x-4 gap-y-0.5 border-b border-zinc-800/50 px-4 py-1 text-[10px] text-zinc-600 sm:px-5"
      role="status"
      aria-label={t("experienceEngineering.trustEyebrow")}
    >
      <span>
        {t("experienceEngineering.confidence")}: <span className="text-zinc-500">{confidence}</span>
      </span>
      <span>
        {t("experienceEngineering.limitations")}: <span className="text-zinc-500">{evidencePulse.limitation}</span>
      </span>
      <span>
        {t("experienceEngineering.reviewState")}: <span className="text-zinc-500">{review}</span>
      </span>
    </div>
  );
}
