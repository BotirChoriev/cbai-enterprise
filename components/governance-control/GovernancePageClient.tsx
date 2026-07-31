"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EngineRouteEntryStrip from "@/components/forward-deployed/EngineRouteEntryStrip";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import GovernanceControlCenter from "@/components/governance-control/GovernanceControlCenter";
import IntelligenceStatusRail from "@/components/shared/IntelligenceStatusRail";

export default function GovernancePageClient() {
  const { t, language } = useTranslation();

  return (
    <OperatingPageShell
      title={t("governancePage.title")}
      description={t("governancePage.description")}
      showOperator
    >
      <IntelligenceStatusRail
        context={language === "uz" ? "Platforma qoidalari va vakolatlar" : "Platform rules and authority"}
        evidence={language === "uz" ? "Har bir amal audit izi bilan bog‘lanadi" : "Every action is linked to an audit trail"}
        unknown={language === "uz" ? "Yopilmagan nazorat va siyosat bo‘shliqlari ko‘rinadi" : "Open controls and policy gaps remain visible"}
        humanBoundary={language === "uz" ? "Qoidani vakolatli inson tasdiqlaydi" : "An authorized human approves the rule"}
      />
      <EngineRouteEntryStrip />
      <p className={cbaiSectionEyebrow}>{t("previewPages.inDevelopmentEyebrow")}</p>
      <p className="text-sm text-zinc-500">{t("governancePage.previewNotice")}</p>
      <GovernanceControlCenter embedded />
    </OperatingPageShell>
  );
}
