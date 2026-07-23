"use client";

import ModeAwareWorkspace from "@/components/user-modes/ModeAwareWorkspace";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { getPhase12Labels, resolvePhase12Locale } from "@/lib/i18n/phase-12-labels";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiTextMuted } from "@/components/brand/brand-classes";

export default function ModesPageClient() {
  const { language } = useTranslation();
  const labels = getPhase12Labels(resolvePhase12Locale(language));

  return (
    <OperatingPageShell
      title={labels.modesTitle}
      description={labels.modesDescription}
      showMissionContext={false}
    >
      <p className={`mb-4 md:hidden ${cbaiTextMuted}`}>{labels.mobileNavNote}</p>
      <ModeAwareWorkspace variant="full" />
    </OperatingPageShell>
  );
}
