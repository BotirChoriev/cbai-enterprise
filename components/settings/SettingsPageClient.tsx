"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import AssistantSettingsForm from "@/components/assistant/AssistantSettingsForm";
import LivingMemoryControl from "@/components/operating/LivingMemoryControl";
import VoiceDiagnosticsPanel from "@/components/settings/VoiceDiagnosticsPanel";
import AdaptiveDensityControl from "@/components/operating/AdaptiveDensityControl";
import CapabilityAssessmentOffer from "@/components/settings/CapabilityAssessmentOffer";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import {
  deriveScreenSimplicityAudit,
  listSimplicityMetrics,
  type PrimaryScreenId,
} from "@/lib/intelligence-os/simplicity-metrics";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const PRIMARY_SCREENS: readonly PrimaryScreenId[] = [
  "home",
  "evidence",
  "reasoning",
  "reports",
  "graph",
  "search",
  "trust",
  "my-work",
];

export default function SettingsPageClient() {
  const { t } = useTranslation();
  const disclosure = useProgressiveDisclosure();
  const metrics = useMemo(() => listSimplicityMetrics(), []);
  const audits = useMemo(
    () => PRIMARY_SCREENS.map((screen) => deriveScreenSimplicityAudit(screen, disclosure.level)),
    [disclosure.level],
  );

  return (
    <OperatingPageShell title={t("navigation.settings")} description={t("settingsPage.description")} showMissionContext={false}>
      <AdaptiveDensityControl />
      <AssistantSettingsForm />
      <VoiceDiagnosticsPanel />
      <CapabilityAssessmentOffer />
      <LivingMemoryControl />
      {disclosure.level === "expert" ? (
        <section className={`${cbaiMineralSurface} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>{t("zeroLearningCurve.simplicityAuditEyebrow")}</p>
        <p className="text-[10px] text-zinc-600">{t("zeroLearningCurve.simplicityAuditNote")}</p>
        <ul className="space-y-1 text-xs text-zinc-500">
          {audits.map((audit) => (
            <li key={audit.screen} className="flex justify-between gap-2">
              <span>{audit.screen}</span>
              <span className={audit.meetsTarget ? "text-emerald-400/80" : "text-amber-400/80"}>
                {audit.score} / {audit.target}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-zinc-600">{t("zeroLearningCurve.simplicityMetricsNote")}</p>
        <ul className="space-y-0.5 text-[10px] text-zinc-600">
          {metrics.map((metric) => (
            <li key={metric.kind}>{t(`zeroLearningCurve.${metric.labelKey}`)}</li>
          ))}
        </ul>
      </section>
      ) : null}
    </OperatingPageShell>
  );
}
