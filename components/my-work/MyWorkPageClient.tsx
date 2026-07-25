"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import MyWork from "@/components/my-work/MyWork";
import AdaptiveWorkspaceClient from "@/components/adaptive-workspace/AdaptiveWorkspaceClient";

export default function MyWorkPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell title={t("myWork.title")}>
      <div className="space-y-10">
        <AdaptiveWorkspaceClient embedded />
        <MyWork />
      </div>
    </OperatingPageShell>
  );
}
