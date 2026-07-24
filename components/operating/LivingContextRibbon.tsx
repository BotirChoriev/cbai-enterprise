"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { deriveFirstMinuteAction, translateFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import { getMissionNextAction } from "@/lib/intelligence-os/mission-lifecycle";
import { shouldShowLivingContextRibbon } from "@/lib/intelligence-os/progressive-disclosure";
import {
  translateEvidencePulseLimitation,
  translateEvidencePulseStateLabel,
} from "@/lib/i18n/investor-translation";
import { cbaiLinkAction, cbaiTextMuted } from "@/components/brand/brand-classes";

/** Compact contextual ribbon — one mission surface, no duplicate giant CTAs. */
export default function LivingContextRibbon() {
  const pathname = usePathname();
  const { t, language } = useTranslation();
  const dictionary = getDictionary(language);
  const { mission, evidencePulse } = useMissionContext();

  if (!shouldShowLivingContextRibbon(pathname, mission)) return null;

  const firstAction = deriveFirstMinuteAction(mission);
  const nextLabel = translateFirstMinuteAction(t, firstAction);
  const stage = getMissionNextAction(mission);
  const pulseLabel = evidencePulse
    ? translateEvidencePulseStateLabel(dictionary, evidencePulse.state)
    : null;

  return (
    <div
      className="cbai-living-context-ribbon shrink-0 border-b border-[var(--cbai-border-subtle)]/60 bg-[color-mix(in_srgb,var(--cbai-surface-glass)_88%,transparent)] px-4 py-1.5 sm:px-5"
      role="region"
      aria-label={t("operatingContext.missionContext")}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 font-medium uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("operatingContext.missionContext")}
          </span>
          <span className="truncate text-[var(--cbai-text-secondary)]">
            {mission?.problem}
          </span>
        </div>
        {stage ? (
          <span className={`hidden shrink-0 sm:inline ${cbaiTextMuted}`}>
            {stage.label}
          </span>
        ) : null}
        {pulseLabel ? (
          <span className={`hidden shrink-0 md:inline ${cbaiTextMuted}`} title={translateEvidencePulseLimitation(dictionary, evidencePulse!.limitationKey) ?? undefined}>
            {t("operatingContext.evidenceState")}: {pulseLabel}
          </span>
        ) : null}
        <Link href={firstAction.href} className={`shrink-0 font-medium text-[var(--cbai-accent-primary)] hover:text-[var(--cbai-accent-hover)] ${cbaiLinkAction}`}>
          {nextLabel} →
        </Link>
      </div>
    </div>
  );
}
