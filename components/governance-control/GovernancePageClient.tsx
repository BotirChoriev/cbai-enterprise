"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import GovernanceControlCenter from "@/components/governance-control/GovernanceControlCenter";
import GlobalStatusStrip from "@/components/enterprise/GlobalStatusStrip";
import { buildGlobalStatus } from "@/lib/enterprise/global-status";

export default function GovernancePageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell
      title={t("governancePage.title")}
      description={t("governancePage.description")}
      showOperator
      statusStrip={<GlobalStatusStrip compact status={buildGlobalStatus()} />}
    >
      <p className={cbaiSectionEyebrow}>{t("previewPages.inDevelopmentEyebrow")}</p>
      <p className="text-sm text-zinc-500">{t("governancePage.previewNotice")}</p>
      <GovernanceControlCenter embedded />
    </OperatingPageShell>
  );
}
