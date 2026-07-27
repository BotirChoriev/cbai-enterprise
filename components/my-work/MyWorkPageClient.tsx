"use client";

import { Suspense } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import IntelligencePageFrame from "@/components/shared/IntelligencePageFrame";
import MyWork from "@/components/my-work/MyWork";
import AdaptiveWorkspaceClient from "@/components/adaptive-workspace/AdaptiveWorkspaceClient";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import { cbaiBtnPrimary, cbaiFocusRing } from "@/components/brand/brand-classes";

function MyWorkBody() {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      <MyWork />
      <details className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-4 py-3">
        <summary className="cursor-pointer list-none text-sm text-[var(--cbai-accent-primary)] marker:content-none [&::-webkit-details-marker]:hidden">
          {t("myWorkExt.advancedEngineSummary")}
        </summary>
        <div className="mt-3 border-t border-[var(--cbai-border-default)] pt-3">
          <AdaptiveWorkspaceClient embedded />
        </div>
      </details>
    </div>
  );
}

export default function MyWorkPageClient() {
  const { t, language } = useTranslation();
  const operationalObjects = useOperationalObjectsOptional();

  function openCreate() {
    operationalObjects?.openComposer(
      {
        type: "work_plan",
        title: "",
        summary: "",
        objective: "",
        rationale: "",
        expectedOutcome: "",
        domain: "general",
        status: "draft",
        priority: "normal",
        requiredInputs: [],
        evidenceRequirements: [],
        nextAction: "",
        humanDecision: "",
        relatedObjectIds: [],
        locale: language,
        provenance: { source: "manual" },
      },
      [],
      "manual",
    );
  }

  return (
    <IntelligencePageFrame
      title={t("myWork.title")}
      purpose={t("operationalObject.cockpitIntro")}
      contextLabel={t("operationalObject.cockpitTitle")}
      nextStep={t("operationalObject.myWorkPageNext")}
      evidenceStatus={t("operationalObject.myWorkEvidenceHint")}
      confirmationBoundary={t("operationalObject.myWorkHumanBoundary")}
      primaryAction={
        operationalObjects ? (
          <button
            type="button"
            className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
            data-cbai-mywork-primary=""
            onClick={openCreate}
          >
            {t("operationalObject.createFromMyWork")}
          </button>
        ) : null
      }
    >
      <Suspense fallback={<p className="text-sm text-[var(--cbai-text-secondary)]">{t("myWork.title")}</p>}>
        <MyWorkBody />
      </Suspense>
    </IntelligencePageFrame>
  );
}
