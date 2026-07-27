"use client";

import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import type { WorkflowResult } from "@/lib/research/workflow/workflow-model";
import type { WorkflowNextAction, WorkflowStage } from "@/lib/research/workflow/workflow-types";
import { deriveResearchHealth } from "@/lib/research/health/health-engine";
import type { ResearchHealthState } from "@/lib/research/health/health-types";
import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";
import {
  getWorkspaceMemory,
  getWorkspaceTimeline,
} from "@/lib/research/intelligence/workspace-shell-engine";
import { WORKSPACE_TIMELINE_EVENT_LABELS } from "@/lib/research/intelligence/workspace-shell-model";
import { buildMissionStatement } from "@/components/research/topic/ResearchMissionWorkspace";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchCockpitProps = {
  topic: ResearchTopic;
  workflow: WorkflowResult | undefined;
};

type TFunc = (path: string, vars?: Record<string, string>) => string;

function translateWorkflowStage(stage: WorkflowStage, t: TFunc): string {
  const map: Record<WorkflowStage, string> = {
    evidence_connection_required: "researchTopicDepth.stageEvidenceConnectionRequired",
    evidence_ready_for_review: "researchTopicDepth.stageEvidenceReadyForReview",
    review_required: "researchTopicDepth.stageReviewRequired",
    monitoring_required: "researchTopicDepth.stageMonitoringRequired",
    unknown: "researchTopicDepth.unknown",
  };
  return t(map[stage]);
}

function translateNextAction(action: WorkflowNextAction, t: TFunc): string {
  const map: Record<WorkflowNextAction, string> = {
    connect_evidence: "researchTopicDepth.actionConnectEvidence",
    open_evidence_review: "researchTopicDepth.actionOpenEvidenceReview",
    continue_review: "researchTopicDepth.actionContinueReview",
    monitor_for_new_evidence: "researchTopicDepth.actionMonitorForNewEvidence",
    no_valid_action: "researchTopicDepth.actionNoValidAction",
    unknown: "researchTopicDepth.unknown",
  };
  return t(map[action]);
}

function translateReadiness(state: ResearchReadinessState, t: TFunc): string {
  const map: Record<ResearchReadinessState, string> = {
    ready: "researchTopicDepth.readinessReady",
    partially_ready: "researchTopicDepth.readinessPartiallyReady",
    needs_evidence: "researchTopicDepth.readinessNeedsEvidence",
    review_required: "researchTopicDepth.readinessReviewRequired",
    unknown: "researchTopicDepth.unknown",
  };
  return t(map[state]);
}

function translateHealth(state: ResearchHealthState, t: TFunc): string {
  const map: Record<ResearchHealthState, string> = {
    healthy: "researchTopicDepth.healthHealthy",
    stable: "researchTopicDepth.healthStable",
    weak: "researchTopicDepth.healthWeak",
    critical: "researchTopicDepth.healthCritical",
  };
  return t(map[state]);
}

function localizeWorkflowReason(workflow: WorkflowResult, t: TFunc): string {
  const stage = translateWorkflowStage(workflow.currentStage, t);
  const action = translateNextAction(workflow.nextAction, t);
  const count = String(workflow.blockingFactors.length);
  if (workflow.blockingFactors.length > 0) {
    return t("researchTopicDepth.workflowReasonBlocked", { stage, action, count });
  }
  return t("researchTopicDepth.workflowReasonOpen", { stage, action });
}

const ADVANCEMENT_REQUIREMENT_KEYS: Record<string, string> = {
  "At least one catalog evidence category must be connected to a source.":
    "researchTopicDepth.requireConnectEvidenceCategory",
  "A research review must be opened for this topic.": "researchTopicDepth.requireOpenReview",
  "Human review of this topic's workspace readiness must be completed.":
    "researchTopicDepth.requireCompleteReview",
  "Topic could not be identified.": "researchTopicDepth.requireTopicIdentified",
};

function localizeAdvancementRequirement(requirement: string, t: TFunc): string {
  const key = ADVANCEMENT_REQUIREMENT_KEYS[requirement];
  return key ? t(key) : requirement;
}

function localizeActionLinkLabel(workflow: WorkflowResult, t: TFunc): string {
  if (!workflow.actionLink) return "";
  if (workflow.nextAction === "open_evidence_review") {
    return t("researchTopicDepth.actionOpenEvidenceReviewLink");
  }
  if (workflow.nextAction === "connect_evidence") {
    const factorLabel = workflow.blockingFactors[0]?.label ?? "";
    return t("researchTopicDepth.actionConnectLabeled", { label: factorLabel });
  }
  return translateNextAction(workflow.nextAction, t);
}

export default function ResearchCockpit({ topic, workflow }: ResearchCockpitProps) {
  const { t } = useTranslation();
  const health = deriveResearchHealth(topic.topicId);
  const timeline = getWorkspaceTimeline(topic.topicId);
  const memory = getWorkspaceMemory(topic.topicId);

  if (!workflow || !health) {
    return null;
  }

  return (
    <div className={`${cbaiGlassCard} space-y-5 p-4 sm:p-5`}>
      <div className="space-y-3">
        <div>
          <p className={cbaiSectionEyebrow}>{t("researchTopicDepth.cockpitEyebrow")}</p>
          <p className="mt-1 text-sm text-zinc-200">{buildMissionStatement(topic, t)}</p>
        </div>

        <dl className="flex flex-wrap gap-2">
          <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
            <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.currentStage")}
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-zinc-200">
              {translateWorkflowStage(workflow.currentStage, t)}
            </dd>
          </div>
          <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
            <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.researchReadiness")}
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-zinc-200">
              {translateReadiness(health.stage, t)}
            </dd>
          </div>
          <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
            <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.researchHealth")}
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-zinc-200">
              {translateHealth(health.state, t)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.currentWorkflow")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">{localizeWorkflowReason(workflow, t)}</p>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.blockingFactors")}
            </p>
            {workflow.blockingFactors.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {workflow.blockingFactors.map((item) => (
                  <li key={item.evidenceItemId} className="text-xs text-zinc-500">
                    {item.label} — {item.note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">{t("researchTopicDepth.noBlockingFactors")}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.recommendedNext")}
            </p>
            {workflow.actionLink ? (
              <Link
                href={workflow.actionLink.href}
                className="mt-1.5 inline-flex rounded-md border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-300 transition-colors hover:border-teal-500/50 hover:bg-teal-500/15"
              >
                {localizeActionLinkLabel(workflow, t)} →
              </Link>
            ) : (
              <>
                <p className="mt-1.5 text-sm font-medium text-zinc-200">
                  {translateNextAction(workflow.nextAction, t)}
                </p>
                {workflow.advancementRequirements.map((requirement) => (
                  <p key={requirement} className="mt-1 text-xs text-zinc-600">
                    {localizeAdvancementRequirement(requirement, t)}
                  </p>
                ))}
              </>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {t("researchTopicDepth.latestActivity")}
            </p>
            {timeline.length > 0 ? (
              <ol className="mt-1.5 space-y-1">
                {timeline.map((event) => (
                  <li key={event.eventId} className="text-xs text-zinc-500">
                    <span className="text-zinc-400">
                      {WORKSPACE_TIMELINE_EVENT_LABELS[event.eventType]}
                    </span>{" "}
                    — {event.description}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">{t("researchTopicDepth.noWorkspaceActivity")}</p>
            )}
          </div>
        </div>
      </div>

      <p className="border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-600">
        {memory
          ? t("researchTopicDepth.resumeSession", {
              stage: translateReadiness(memory.lastStage, t),
            })
          : t("researchTopicDepth.noPreviousSession")}
      </p>
    </div>
  );
}
