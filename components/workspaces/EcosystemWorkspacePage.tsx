"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type EcosystemWorkspacePageProps = {
  titleKey: "navigation.government" | "navigation.investor" | "navigation.citizen";
  previewKey: "governancePreview" | "investorPreview" | "citizenPreview";
  children: ReactNode;
};

export default function EcosystemWorkspacePage({
  titleKey,
  previewKey,
  children,
}: EcosystemWorkspacePageProps) {
  const { t } = useTranslation();

  return (
    <OperatingPageShell title={t(titleKey)} description={t(`previewPages.${previewKey}`)}>
      <p className={`${cbaiGlassCard} px-4 py-3 text-xs text-zinc-500`}>
        {t("intelligenceLenses.notPortal")} — {t(`previewPages.${previewKey}`)}
      </p>
      {children}
    </OperatingPageShell>
  );
}
