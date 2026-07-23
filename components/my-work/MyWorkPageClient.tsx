"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import MyWork from "@/components/my-work/MyWork";
import MissionEngineStagePanel from "@/components/mission/MissionEngineStagePanel";

export default function MyWorkPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell title={t("myWork.title")} missionContextVariant="compact">
      <MissionEngineStagePanel />
      <MyWork />
    </OperatingPageShell>
  );
}
