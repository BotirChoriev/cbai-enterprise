import Link from "next/link";
import { buildResearchMission } from "@/lib/research-mission/research-mission-builder";
import { MISSION_LIFECYCLE_STATE_LABELS } from "@/lib/research-mission/research-mission-engine";
import { WORKFLOW_STATE_LABELS } from "@/lib/foundation/workflow-types";
import { VERIFICATION_STATUS_LABELS } from "@/lib/foundation/evidence-types";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchIntelligenceOverviewProps = {
  topicId: string;
};

/**
 * The one live consumer of the full Research Intelligence chain — Research Domain (Phase 1/2) →
 * Research Mission (Phase 4) → Research Workspace Contract (Phase 3) → Orchestration Pipeline →
 * Evidence/Relationships/Reasoning/Workflow → Global Intelligence Network. Server component: no
 * client state, no hooks. Calls `buildResearchMission` exactly once — the single Workspace
 * object this section renders from — and reads everything else off its already-computed
 * `workspaceContract` and mission-lifecycle fields; this file contains no evidence, relationship,
 * reasoning, or workflow logic of its own, and never calls a lower-level engine directly.
 *
 * Deliberately does not duplicate ResearchCockpit (current stage / blocking factors / latest
 * workspace activity, all from the pre-existing legacy engines), the Review Workspace, or the
 * Evidence Workspace — this section shows what the Platform Core + Research Domain layers
 * specifically add: the Evidence Center's per-item verification status, the Reasoning
 * Framework's known-unknowns and observed facts, the new universal Workflow's own state, the
 * Research Mission's own project lifecycle, and real Research Domain connections (organizations,
 * datasets). Where the Contract has no real data yet, an honest empty-state sentence is shown —
 * never a fabricated value.
 */
export default function ResearchIntelligenceOverview({ topicId }: ResearchIntelligenceOverviewProps) {
  const mission = buildResearchMission({ missionId: topicId });
  const contract = mission.workspaceContract;

  if (!contract) {
    return null;
  }

  const { missionSummary, missionProgress, evidenceSummary, researchQuestions, researchTimeline, activityTimeline } =
    contract;

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
        <p className={cbaiSectionEyebrow}>Research intelligence</p>
        <h2 id="research-intelligence-overview-heading" className="mt-1 text-base font-semibold text-zinc-100">
          {missionSummary.missionCenter.question.question}
        </h2>
      </div>

      <dl className="flex flex-wrap gap-2">
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">Mission lifecycle</dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">
            {MISSION_LIFECYCLE_STATE_LABELS[mission.currentState]}
          </dd>
        </div>
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">Workflow state</dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">
            {missionProgress.monitoring.currentState
              ? WORKFLOW_STATE_LABELS[missionProgress.monitoring.currentState]
              : "Unknown"}
          </dd>
        </div>
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">Evidence connected</dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">{evidenceSummary.evidence.length}</dd>
        </div>
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">Open questions</dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">{researchQuestions.questions.length}</dd>
        </div>
        <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
          <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">Pipeline stages run</dt>
          <dd className="mt-0.5 text-xs font-medium text-zinc-200">{activityTimeline.pipelineTrace.length}</dd>
        </div>
      </dl>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Evidence status</p>
            {evidenceSummary.evidence.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {evidenceSummary.evidence.map((item) => (
                  <li key={item.evidenceId} className="text-xs text-zinc-500">
                    {item.label} —{" "}
                    {item.verificationStatus ? VERIFICATION_STATUS_LABELS[item.verificationStatus] : "Unknown"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">No evidence connected yet.</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Known evidence gaps</p>
            {missionSummary.intelligenceBrief && missionSummary.intelligenceBrief.knownUnknowns.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {missionSummary.intelligenceBrief.knownUnknowns.map((gap) => (
                  <li key={gap.question} className="text-xs text-zinc-500">
                    {gap.question} — {gap.reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">No known evidence gaps recorded.</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Reasoning summary</p>
            {missionSummary.intelligenceBrief && missionSummary.intelligenceBrief.observedFacts.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {missionSummary.intelligenceBrief.observedFacts.map((fact) => (
                  <li key={fact.statement} className="text-xs text-zinc-500">
                    {fact.statement}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">
                No facts have been independently verified yet — nothing connected has reached &ldquo;verified&rdquo;
                status.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Recommended next step</p>
            {missionProgress.recommendedNextStep ? (
              missionProgress.recommendedNextStep.href ? (
                <Link
                  href={missionProgress.recommendedNextStep.href}
                  className="mt-1.5 inline-flex rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/15"
                >
                  {missionProgress.recommendedNextStep.label} →
                </Link>
              ) : (
                <p className="mt-1.5 text-xs text-zinc-500">{missionProgress.recommendedNextStep.reason}</p>
              )
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">No further action is recommended right now.</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Related entities and network connections
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
              <p className="mt-1.5 text-xs text-zinc-600">No related organizations or datasets connected yet.</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Recent real timeline activity
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
              <p className="mt-1.5 text-xs text-zinc-600">No research activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {emptySections.length > 0 ? (
        <p className="border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-600">
          No {emptySections.join(", ")} are connected yet — honestly empty, not an error.
        </p>
      ) : null}
    </section>
  );
}
