"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import ResearchCanvasClient from "@/components/research/canvas/ResearchCanvasClient";

export default function ResearchCanvasPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell
      title={t("researchCanvas.pageTitle")}
      showOperator
      missionContextVariant="compact"
    >
      <ResearchCanvasClient />
    </OperatingPageShell>
  );
}
