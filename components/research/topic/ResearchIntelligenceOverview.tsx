"use client";

import Link from "next/link";
import { buildResearchMission } from "@/lib/research-mission/research-mission-builder";
import { MISSION_LIFECYCLE_STATE_LABELS } from "@/lib/research-mission/research-mission-engine";
import { WORKFLOW_STATE_LABELS } from "@/lib/foundation/workflow-types";
import { VERIFICATION_STATUS_LABELS } from "@/lib/foundation/evidence-types";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchIntelligenceOverviewProps = {
  topicId: string;
};

export default function ResearchIntelligenceOverview({ topicId }: ResearchIntelligenceOverviewProps) {
  const { t } = useTranslation();
  const mission = buildResearchMission({ missionId: topicId });
  const contract = mission.workspaceContract;

  if (!contract) {
    return null;
  }

  const { missionSummary, missionProgress, evidenceSummary, researchQuestions, researchTimeline } = contract;

  const relatedEntities = [
    ...contract.relatedOrganizations.organizations,
    ...contract.relatedDatasets.datasets,
  ];

  const emptySections: string[] = [];
  if (mission.hypotheses.length === 0) emptySections.push("hypotheses");
  if (contract.researchFindings.findings.length === 0) emptySections.push("findings");
  if (mission.relatedPublications.length === 0) emptySections.push("publications");
  if (mission.relatedPatents.length === 0) emptySections.push("patents");
  if (contract.relatedTechnologies.technologies.length === 0) emptySections.push("technologies");
  if (mission.participants.length === 0) emptySections.push("team members");
  if (contract.fundingOpportunities.opportunities.length === 0 && contract.fundingOpportunities.grants.length === 0)
    emptySections.push("funding opportunities");
  if (contract.potentialCollaborators.candidates.length === 0) emptySections.push("potential collaborators");
  if (mission.risks.length === 0) emptySections.push("risks");
  if (mission.milestones.length === 0) emptySections.push("milestones");
  if (mission.deliverables.length === 0) emptySections.push("deliverables");

  return (
    <section aria-labelledby="research-intelligence-overview-heading" className={`${cbaiGlassCard} space-y-5 p-4 sm:p-5`}>
      <div>
        <p className={cbaiSectionEyebrow}>{t("researchTopicDepth.intelligenceEyebrow")}</p>
        <h2 id="research-intelligence-overview-heading" className="mt-1 text-base font-semibold text-zinc-100">
          {missionSummary.missionCenter.question.question}
        </h2>
      </div>

      <dl className="flex flex-wrap gap-2">
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopicDepth.missionLifecycle")}
          </dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">
            {MISSION_LIFECYCLE_STATE_LABELS[mission.currentState]}
          </dd>
        </div>
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopicDepth.workflowState")}
          </dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">
            {missionProgress.monitoring.currentState
              ? WORKFLOW_STATE_LABELS[missionProgress.monitoring.currentState]
              : t("researchTopicDepth.unknown")}
          </dd>
        </div>
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopicDepth.evidenceConnected")}
          </dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">{evidenceSummary.evidence.length}</dd>
        </div>
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopicDepth.openQuestions")}
          </dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">{researchQuestions.questions.length}</dd>
        </div>
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopicDepth.analysisSteps")}
          </dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">{contract.activityTimeline.pipelineTrace.length}</dd>
        </div>
      </dl>

      <div className="grid gap-5 lg:grid-cols-2">
        <div id="evidence" className="space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.evidenceStatus")}
            </p>
            {evidenceSummary.evidence.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {evidenceSummary.evidence.map((item) => (
                  <li key={item.evidenceId} className="text-xs text-zinc-500">
                    {item.label} —{" "}
                    {item.verificationStatus
                      ? VERIFICATION_STATUS_LABELS[item.verificationStatus]
                      : t("researchTopicDepth.unknown")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">{t("researchTopicDepth.noEvidenceConnected")}</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.knownEvidenceGaps")}
            </p>
            {missionSummary.intelligenceBrief && missionSummary.intelligenceBrief.knownUnknowns.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {missionSummary.intelligenceBrief.knownUnknowns.map((gap) => (
                  <li key={gap.question} className="text-xs text-zinc-500">
                    {gap.question} — {gap.reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">{t("researchTopicDepth.noKnownEvidenceGaps")}</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.reasoningSummary")}
            </p>
            {missionSummary.intelligenceBrief && missionSummary.intelligenceBrief.observedFacts.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {missionSummary.intelligenceBrief.observedFacts.map((fact) => (
                  <li key={fact.statement} className="text-xs text-zinc-500">
                    {fact.statement}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">{t("researchTopicDepth.noVerifiedFacts")}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.recommendedNextStep")}
            </p>
            {missionProgress.recommendedNextStep ? (
              missionProgress.recommendedNextStep.href ? (
                <Link
                  href={missionProgress.recommendedNextStep.href}
                  className="mt-1.5 inline-flex rounded-md border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-300 transition-colors hover:border-teal-500/50 hover:bg-teal-500/15"
                >
                  {missionProgress.recommendedNextStep.label} →
                </Link>
              ) : (
                <p className="mt-1.5 text-xs text-zinc-500">{missionProgress.recommendedNextStep.reason}</p>
              )
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">{t("researchTopicDepth.noFurtherAction")}</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.relatedEntitiesNetwork")}
            </p>
            {relatedEntities.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {relatedEntities.map((entity) => (
                  <li key={entity.entityId} className="text-xs text-zinc-500">
                    {entity.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">{t("researchTopicDepth.noRelatedEntities")}</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.recentTimelineActivity")}
            </p>
            {researchTimeline.events.length > 0 ? (
              <ol className="mt-1.5 space-y-1">
                {researchTimeline.events.map((event) => (
                  <li key={event.eventId} className="text-xs text-zinc-500">
                    {event.description}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">{t("researchTopicDepth.noResearchActivity")}</p>
            )}
          </div>
        </div>
      </div>

      {emptySections.length > 0 ? (
        <p className="border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-600">
          {t("researchTopicDepth.emptySections", { sections: emptySections.join(", ") })}
        </p>
      ) : null}
    </section>
  );
}
