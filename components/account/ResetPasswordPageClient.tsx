"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import ResetPasswordForm from "@/components/account/ResetPasswordForm";

export default function ResetPasswordPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell
      title={t("accountPage.resetPassword")}
      description={t("resetPasswordPage.pageDescription")}
      showOperator={false}
    >
      <div className="mx-auto max-w-lg">
        <ResetPasswordForm />
      </div>
    </OperatingPageShell>
  );
}
