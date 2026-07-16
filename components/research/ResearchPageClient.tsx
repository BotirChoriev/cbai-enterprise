"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import ResearchHome from "@/components/research/ResearchHome";

export default function ResearchPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell
      title={t("navigation.research")}
      description={t("researchHome.pageDescription")}
      showOperator
    >
      <ResearchHome />
    </OperatingPageShell>
  );
}
