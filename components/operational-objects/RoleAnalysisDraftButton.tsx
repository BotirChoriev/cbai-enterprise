"use client";

import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnSecondarySm, cbaiFocusRing } from "@/components/brand/brand-classes";
import type { OperationalObjectDomain } from "@/lib/operational-objects/operational-object.types";
import { emitPlatformActionResult } from "@/lib/platform-actions/action-result-events";

type RoleAnalysisDraftButtonProps = {
  readonly domain: Extract<OperationalObjectDomain, "investor" | "governance">;
  readonly titleHint: string;
  readonly routePath: string;
};

/** Investor / Government analysis draft — non-advisory, confirmation required. */
export default function RoleAnalysisDraftButton({ domain, titleHint, routePath }: RoleAnalysisDraftButtonProps) {
  const { t, language } = useTranslation();
  const operationalObjects = useOperationalObjectsOptional();
  if (!operationalObjects) return null;

  function openDraft() {
    operationalObjects!.openComposer(
      {
        type: "decision_brief",
        title: titleHint,
        summary: titleHint,
        objective: titleHint,
        rationale: t("operationalObject.roleAnalysisNonAdvisory"),
        expectedOutcome: "",
        domain,
        status: "draft",
        priority: "normal",
        requiredInputs: [],
        evidenceRequirements: [t("operationalObject.linkedEvidenceOfficialSources")],
        nextAction: t("operationalObject.linkedWorkDefaultNextAction"),
        humanDecision: "",
        relatedObjectIds: [],
        locale: language,
        assumptions: [t("operationalObject.roleAnalysisAssumption")],
        missingInformation: [t("operationalObject.roleAnalysisMissing")],
        provenance: {
          source: "manual",
          routePath,
          locale: language,
          inferredFields: ["type", "domain", "title", "nextAction"],
        },
      },
      ["type", "domain", "title", "nextAction"],
      "manual",
    );
    emitPlatformActionResult({
      kind: "draft_prepared",
      actionId: "operational_object.compose",
      message: domain,
      href: routePath,
    });
  }

  return (
    <button
      type="button"
      className={`${cbaiBtnSecondarySm} ${cbaiFocusRing}`}
      data-cbai-role-analysis={domain}
      onClick={openDraft}
    >
      {t("operationalObject.roleAnalysisCreate")}
    </button>
  );
}
