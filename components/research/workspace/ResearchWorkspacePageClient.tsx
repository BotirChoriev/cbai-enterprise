"use client";

import { Suspense } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import ResearchWorkspaceHome from "@/components/research/workspace/ResearchWorkspaceHome";

export default function ResearchWorkspacePageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell
      title={t("researchWorkspace.title")}
      description={t("researchWorkspace.shellNotice")}
      showOperator
    >
      <Suspense fallback={null}>
        <ResearchWorkspaceHome embedded />
      </Suspense>
    </OperatingPageShell>
  );
}
