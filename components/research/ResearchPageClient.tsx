"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import ResearchHome from "@/components/research/ResearchHome";
import GlobalStatusStrip from "@/components/enterprise/GlobalStatusStrip";
import { buildGlobalStatus } from "@/lib/enterprise/global-status";

export default function ResearchPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell
      title={t("navigation.research")}
      showOperator={false}
      missionContextVariant="compact"
      statusStrip={<GlobalStatusStrip compact status={buildGlobalStatus()} />}
    >
      <ResearchHome />
    </OperatingPageShell>
  );
}
