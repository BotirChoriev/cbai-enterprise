"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import AssistantSettingsForm from "@/components/assistant/AssistantSettingsForm";
import LivingMemoryControl from "@/components/operating/LivingMemoryControl";
import AdaptiveDensityControl from "@/components/operating/AdaptiveDensityControl";
import CapabilityAssessmentOffer from "@/components/settings/CapabilityAssessmentOffer";

export default function SettingsPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell title={t("navigation.settings")} description={t("settingsPage.description")}>
      <AssistantSettingsForm />
      <AdaptiveDensityControl />
      <CapabilityAssessmentOffer />
      <LivingMemoryControl />
    </OperatingPageShell>
  );
}
