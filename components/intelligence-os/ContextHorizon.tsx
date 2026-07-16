"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { runDiscoveryEngine } from "@/lib/discovery/discovery-engine";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";

type ContextHorizonProps = {
  mission: Mission | null;
};

export default function ContextHorizon({ mission }: ContextHorizonProps) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const discovery = hydrated ? runDiscoveryEngine(resolveOperatorName(profile)) : null;

  const missingItems = [
    mission?.evidenceMissing,
    mission?.capabilitiesNeeded,
  ].filter(Boolean) as string[];

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-5`} aria-labelledby="context-horizon-heading">
      <p className={cbaiSectionEyebrow}>{t("missionCenter.contextHorizon")}</p>
      <h2 id="context-horizon-heading" className="text-sm font-medium text-zinc-200">
        {t("missionCenter.contextHorizonBody")}
      </h2>

      {missingItems.length > 0 ? (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {t("missionCenter.missingKnowledge")}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {missingItems.map((item) => (
              <li key={item} className="text-sm text-zinc-400">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">{t("missionCenter.noMissionBody")}</p>
      )}

      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {t("missionCenter.suggestedCollaborators")}
        </h3>
        <p className="mt-1 text-xs text-amber-400/80">{t("missionCenter.collaboratorsNotConnected")}</p>
        {discovery && discovery.candidates.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {discovery.candidates.slice(0, 3).map((c) => (
              <li key={c.id} className="text-sm text-zinc-400">
                {c.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link href="/graph" className="text-xs text-teal-400 hover:text-teal-300">
          {t("missionCenter.knowledgeNetwork")} →
        </Link>
        <Link href="/knowledge" className="text-xs text-teal-400 hover:text-teal-300">
          {t("missionCenter.evidenceNetwork")} →
        </Link>
      </div>
    </section>
  );
}
