"use client";

import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function SimpleEmptyWorkspace({
  titleKey,
  introKey,
}: {
  titleKey: string;
  introKey?: string;
}) {
  const { t } = useTranslation();
  return (
    <OperatingPageShell title={t(titleKey)} description={introKey ? t(introKey) : t("authCollab.emptyHonest")}>
      <p className="text-sm text-[var(--muted)]">{t("authCollab.emptyNoItems")}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{t("authCollab.emptyHonest")}</p>
    </OperatingPageShell>
  );
}
