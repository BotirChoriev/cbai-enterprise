"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import MyWork from "@/components/my-work/MyWork";

export default function MyWorkPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell title={t("myWork.title")} description={t("myWork.pageDescription")}>
      <MyWork />
    </OperatingPageShell>
  );
}
