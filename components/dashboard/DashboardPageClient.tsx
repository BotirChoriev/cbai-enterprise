"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import ProductDashboard from "@/components/dashboard/ProductDashboard";
import HomeEcosystems from "@/components/platform/home/HomeEcosystems";
import HomeCapabilityFlow from "@/components/platform/home/HomeCapabilityFlow";
import HomeAudience from "@/components/platform/home/HomeAudience";

export default function DashboardPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell title={t("navigation.dashboard")} description={t("dashboardPage.description")}>
      <ProductDashboard />
      <HomeEcosystems />
      <HomeCapabilityFlow />
      <HomeAudience />
    </OperatingPageShell>
  );
}
