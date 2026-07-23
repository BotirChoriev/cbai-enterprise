"use client";

import EvidenceWorkspacePanel from "@/components/evidence/EvidenceWorkspacePanel";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { getPhase12Labels, resolvePhase12Locale } from "@/lib/i18n/phase-12-labels";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiTextMuted } from "@/components/brand/brand-classes";

export default function EvidenceWorkspacePageClient() {
  const { language } = useTranslation();
  const labels = getPhase12Labels(resolvePhase12Locale(language));

  return (
    <OperatingPageShell
      title={labels.evidenceWorkspaceTitle}
      description={labels.evidenceWorkspaceDescription}
      missionContextVariant="compact"
    >
      <p className={`mb-4 md:hidden ${cbaiTextMuted}`}>{labels.mobileNavNote}</p>
      <EvidenceWorkspacePanel />
    </OperatingPageShell>
  );
}
