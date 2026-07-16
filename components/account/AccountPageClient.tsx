"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import AccountForm from "@/components/account/AccountForm";

export default function AccountPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell title={t("navigation.account")} description={t("accountPage.pageDescription")} showMissionContext={false}>
      <div className="mx-auto max-w-lg">
        <AccountForm />
      </div>
    </OperatingPageShell>
  );
}
