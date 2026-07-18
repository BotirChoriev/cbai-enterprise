"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import {
  loadExecutionTasks,
  loadExecutionTask,
  updateExecutionTask,
  type GenesisExecutionTask,
} from "@/lib/genesis/execution-store";
import { createProgressUpdate, loadProgressUpdates } from "@/lib/genesis/progress-update-store";
import { createBlocker, loadBlockers, updateBlockerStatus } from "@/lib/genesis/blocker-store";
import {
  createOutcome,
  loadOutcomes,
  submitOutcomeForReview,
  updateOutcomeVerification,
} from "@/lib/genesis/outcome-store";
import {
  createContributionClaim,
  submitContributionEvidence,
  submitContributionForReview,
  updateContributionState,
  loadContributionClaims,
  createRecognitionRecord,
  deriveRecognitionReadiness,
  updateRecognitionStatus,
  loadRecognitionRecords,
} from "@/lib/genesis/contribution-store";
import { BLOCKER_TYPES } from "@/lib/genesis/genesis-types";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type Props = {
  organizationId: string;
  operatorName: string;
};

export default function OperationalLoopPanel({ organizationId, operatorName }: Props) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [progressSummary, setProgressSummary] = useState("");
  const [progressCompleted, setProgressCompleted] = useState("");
  const [progressCurrent, setProgressCurrent] = useState("");
  const [progressNext, setProgressNext] = useState("");

  const [blockerType, setBlockerType] = useState<(typeof BLOCKER_TYPES)[number]>("Missing Evidence");
  const [blockerDesc, setBlockerDesc] = useState("");
  const [blockerDecision, setBlockerDecision] = useState("");
  const [blockerResolution, setBlockerResolution] = useState("");

  const [completionEvidence, setCompletionEvidence] = useState("");

  const [outcomeTitle, setOutcomeTitle] = useState("");
  const [outputDesc, setOutputDesc] = useState("");
  const [outcomeDesc, setOutcomeDesc] = useState("");
  const [impactClaim, setImpactClaim] = useState("");
  const [outcomeEvidence, setOutcomeEvidence] = useState("");

  const [contribClaim, setContribClaim] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [selectedOutcomeId, setSelectedOutcomeId] = useState("");
  const [selectedContribId, setSelectedContribId] = useState("");

  useEffect(() => {
    const onChange = () => bump();
    window.addEventListener(MISSION_DATA_CHANGED, onChange);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChange);
  }, [bump]);

  const mission = useMemo(() => {
    void tick;
    return hydrated ? loadCurrentMission() : null;
  }, [hydrated, tick]);

  const tasks = useMemo(() => {
    void tick;
    return hydrated ? loadExecutionTasks(organizationId) : [];
  }, [hydrated, organizationId, tick]);

  const task = useMemo((): GenesisExecutionTask | null => {
    void tick;
    const id = selectedTaskId || tasks[0]?.id;
    return id && hydrated ? loadExecutionTask(id) : null;
  }, [hydrated, selectedTaskId, tasks, tick]);

  const progressHistory = useMemo(() => {
    void tick;
    return task ? loadProgressUpdates({ taskId: task.id }) : [];
  }, [task, tick]);

  const blockers = useMemo(() => {
    void tick;
    return task ? loadBlockers({ taskId: task.id }) : [];
  }, [task, tick]);

  const outcomes = useMemo(() => {
    void tick;
    return hydrated ? loadOutcomes({ organizationId }) : [];
  }, [hydrated, organizationId, tick]);

  const contributions = useMemo(() => {
    void tick;
    return hydrated ? loadContributionClaims({ organizationId }) : [];
  }, [hydrated, organizationId, tick]);

  const recognitions = useMemo(() => {
    void tick;
    return hydrated ? loadRecognitionRecords() : [];
  }, [hydrated, tick]);

  if (!hydrated) return null;

  const taskContext = () => ({
    organizationId,
    missionId: mission?.id ?? task?.missionId ?? null,
    projectId: mission?.projectId ?? task?.projectId ?? null,
    directiveId: task?.directiveId ?? null,
    planId: task?.planId ?? null,
    taskId: task!.id,
  });

  const addProgress = () => {
    if (!task || !progressSummary.trim()) return;
    createProgressUpdate({
      ...taskContext(),
      author: operatorName,
      reportingPeriod: new Date().toISOString().slice(0, 7),
      summary: progressSummary.trim(),
      workCompleted: progressCompleted.trim(),
      currentWork: progressCurrent.trim(),
      nextPlannedWork: progressNext.trim(),
      evidenceRefs: [],
      reportedDate: new Date().toISOString().slice(0, 10),
      limitationText: "Self-reported; not independently verified.",
      humanReviewStatus: "none",
    });
    setProgressSummary("");
    setProgressCompleted("");
    setProgressCurrent("");
    setProgressNext("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const reportBlocker = () => {
    if (!task || !blockerDesc.trim()) return;
    createBlocker({
      ...taskContext(),
      blockerType,
      description: blockerDesc.trim(),
      severity: "medium",
      operationalImpact: "",
      evidenceRefs: [],
      responsibleOwner: operatorName,
      requiredDecision: blockerDecision.trim(),
      proposedOptions: "",
      dueDate: null,
    });
    setBlockerDesc("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const resolveBlocker = (blockerId: string) => {
    if (!blockerResolution.trim()) {
      setFeedback(t("genesisOs.blockerResolutionRequired"));
      return;
    }
    updateBlockerStatus(blockerId, {
      status: "Resolved",
      resolution: blockerResolution.trim(),
      resolutionEvidence: completionEvidence.trim() || null,
    });
    setBlockerResolution("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const completeTask = () => {
    if (!task) return;
    if (!completionEvidence.trim()) {
      setFeedback(t("genesisOs.evidenceRequired"));
      return;
    }
    const updated = updateExecutionTask(task.id, {
      status: "Completed",
      completionEvidence: completionEvidence.trim(),
    });
    if (updated) {
      setCompletionEvidence("");
      setFeedback(t("genesisOs.saved"));
      bump();
    }
  };

  const recordOutcome = () => {
    if (!task || !outcomeTitle.trim() || !outputDesc.trim() || !outcomeDesc.trim()) return;
    const evidenceRefs = outcomeEvidence.trim()
      ? [{ label: outcomeEvidence.trim() }]
      : [];
    const outcome = createOutcome({
      organizationId,
      missionId: mission?.id ?? task.missionId ?? null,
      projectId: mission?.projectId ?? task.projectId ?? null,
      directiveId: task.directiveId,
      taskIds: [task.id],
      title: outcomeTitle.trim(),
      outputDescription: outputDesc.trim(),
      outcomeDescription: outcomeDesc.trim(),
      impactClaim: impactClaim.trim(),
      baseline: "",
      target: "",
      currentValue: "",
      unit: "",
      reportingPeriod: new Date().toISOString().slice(0, 7),
      evidenceRefs,
      responsibleOwner: operatorName,
      limitations: "Impact claim requires separate verification.",
      humanityImpact: "",
      natureImpact: "",
    });
    setSelectedOutcomeId(outcome.id);
    setOutcomeTitle("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const submitOutcomeReview = () => {
    const id = selectedOutcomeId || outcomes[outcomes.length - 1]?.id;
    if (!id) return;
    if (!outcomeEvidence.trim()) {
      setFeedback(t("genesisOs.outcomeEvidenceRequired"));
      return;
    }
    submitOutcomeForReview(id, operatorName);
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const reviewOutcome = (status: "Supported" | "Partially Supported" | "Disputed") => {
    const id = selectedOutcomeId || outcomes.find((o) => o.verificationStatus === "Submitted for Review")?.id;
    if (!id) return;
    const result = updateOutcomeVerification(id, status, operatorName, reviewReason);
    if (!result) {
      setFeedback(t("genesisOs.outcomeReviewGateFailed"));
      return;
    }
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const createClaim = () => {
    const outcomeId = selectedOutcomeId || outcomes[0]?.id;
    if (!contribClaim.trim()) return;
    const claim = createContributionClaim({
      outcomeId: outcomeId ?? null,
      organizationId,
      missionId: mission?.id ?? null,
      projectId: mission?.projectId ?? null,
      directiveId: task?.directiveId ?? null,
      taskIds: task ? [task.id] : [],
      teamId: null,
      claimedChange: contribClaim.trim(),
      claimedBy: operatorName,
      contributorTeam: null,
      evidenceRefs: outcomeEvidence.trim() ? [{ label: outcomeEvidence.trim() }] : [],
      otherFactors: "Other factors may contribute to observed change.",
      uncertainty: "Causation not proven automatically.",
      state: "Claimed",
    });
    setSelectedContribId(claim.id);
    setContribClaim("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const reviewContribution = (state: "Partially Supported" | "Supported" | "Disputed" | "Insufficient Evidence") => {
    const id = selectedContribId || contributions[contributions.length - 1]?.id;
    if (!id) return;
    updateContributionState(id, state, operatorName, reviewReason || `Review: ${state}`);
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const draftRecognition = () => {
    const outcomeId = selectedOutcomeId || outcomes.find((o) => o.verificationStatus === "Supported")?.id;
    const contribIds = contributions.filter((c) => c.state === "Supported" || c.state === "Partially Supported").map((c) => c.id);
    const outcome = outcomes.find((o) => o.id === outcomeId);
    const readiness = deriveRecognitionReadiness({
      outcomeId,
      evidenceSources: outcome?.evidenceRefs.map((e) => e.label) ?? [],
      contributionIds: contribIds,
      methodologies: ["Document review"],
      limitations: "Local demonstration only.",
      reviewers: [operatorName],
      outcomeVerificationStatus: outcome?.verificationStatus,
      contributionStates: contributions.map((c) => c.state),
    });
    const record = createRecognitionRecord({
      outcomeId: outcomeId ?? null,
      recognizedChange: outcome?.outcomeDescription ?? "Recognized change",
      subject: outcome?.title ?? "Mission outcome",
      period: outcome?.reportingPeriod ?? "",
      evidenceSources: outcome?.evidenceRefs.map((e) => e.label) ?? [],
      methodologies: ["Document review"],
      contributionIds: contribIds,
      reviewers: [operatorName],
      limitations: "Local demonstration — not independent review unless backend configured.",
      disputes: "",
      humanityImpact: outcome?.humanityImpact ?? "",
      natureImpact: outcome?.natureImpact ?? "",
      visibility: "private",
      status: readiness.ready ? "Under Independent Review" : "Evidence Incomplete",
      missionId: mission?.id ?? null,
    });
    if (record) {
      setFeedback(readiness.ready ? t("genesisOs.saved") : `${t("genesisOs.recognitionGaps")}: ${readiness.missing.join(" ")}`);
      bump();
    }
  };

  const approveRecognition = () => {
    const rec = recognitions.find((r) => r.status === "Under Independent Review");
    if (!rec) return;
    const outcome = outcomes.find((o) => o.id === rec.outcomeId);
    const updated = updateRecognitionStatus(rec.id, "Supported", operatorName, reviewReason, {
      outcomeVerificationStatus: outcome?.verificationStatus,
      contributionStates: contributions.map((c) => c.state),
    });
    if (!updated) {
      setFeedback(t("genesisOs.recognitionGateFailed"));
      return;
    }
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  return (
    <section className="space-y-4" aria-labelledby="operational-loop-heading">
      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>{t("genesisOs.operationalLoopEyebrow")}</p>
        <h2 id="operational-loop-heading" className="text-sm font-semibold text-zinc-100">
          {t("genesisOs.operationalLoopTitle")}
        </h2>
        <p className="text-xs text-zinc-600">{t("genesisOs.deviceLocalLimitation")}</p>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <label className="text-xs text-zinc-500">{t("genesisOs.selectTask")}</label>
        <select
          value={selectedTaskId || tasks[0]?.id || ""}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
        >
          {tasks.length === 0 ? <option value="">—</option> : null}
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} · {t.status}
            </option>
          ))}
        </select>
        {task?.status === "Blocked" ? (
          <p className="text-xs text-amber-400/90">{t("genesisOs.taskBlockedNotice")}</p>
        ) : null}
      </div>

      {task ? (
        <>
          <div className={`${cbaiGlassCard} grid gap-4 p-4 lg:grid-cols-2`}>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.progressUpdateTitle")}</h3>
              <input
                value={progressSummary}
                onChange={(e) => setProgressSummary(e.target.value)}
                placeholder={t("genesisOs.progressSummary")}
                className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
              />
              <textarea
                value={progressCompleted}
                onChange={(e) => setProgressCompleted(e.target.value)}
                placeholder={t("genesisOs.workCompleted")}
                rows={2}
                className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
              />
              <textarea
                value={progressCurrent}
                onChange={(e) => setProgressCurrent(e.target.value)}
                placeholder={t("genesisOs.currentWork")}
                rows={2}
                className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
              />
              <textarea
                value={progressNext}
                onChange={(e) => setProgressNext(e.target.value)}
                placeholder="Next planned work"
                rows={2}
                className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
              />
              <button type="button" onClick={addProgress} className={`${cbaiBtnPrimary} min-h-10`}>
                {t("genesisOs.addProgressUpdate")}
              </button>
              {progressHistory.length > 0 ? (
                <ul className="max-h-24 space-y-1 overflow-y-auto text-[10px] text-zinc-500">
                  {progressHistory.map((p) => (
                    <li key={p.id}>
                      {p.reportedDate}: {p.summary}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.blockerTitle")}</h3>
              <select
                value={blockerType}
                onChange={(e) => setBlockerType(e.target.value as (typeof BLOCKER_TYPES)[number])}
                className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
              >
                {BLOCKER_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
              <textarea
                value={blockerDesc}
                onChange={(e) => setBlockerDesc(e.target.value)}
                placeholder={t("genesisOs.blockerDescription")}
                rows={2}
                className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
              />
              <input
                value={blockerDecision}
                onChange={(e) => setBlockerDecision(e.target.value)}
                placeholder={t("genesisOs.requiredDecision")}
                className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
              />
              <button type="button" onClick={reportBlocker} className={`${cbaiBtnPrimary} min-h-10`}>
                {t("genesisOs.reportBlocker")}
              </button>
              {blockers.filter((b) => b.status !== "Resolved" && b.status !== "Closed").map((b) => (
                <div key={b.id} className="rounded border border-zinc-800 p-2 text-xs text-zinc-400">
                  {b.blockerType}: {b.description}
                  <input
                    value={blockerResolution}
                    onChange={(e) => setBlockerResolution(e.target.value)}
                    placeholder={t("genesisOs.blockerResolution")}
                    className={`mt-2 min-h-8 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-2 text-xs ${cbaiFocusRing}`}
                  />
                  <button type="button" onClick={() => resolveBlocker(b.id)} className={`${cbaiBtnPrimary} mt-2 min-h-8 text-xs`}>
                    {t("genesisOs.resolveBlocker")}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cbaiGlassCard} space-y-2 p-4`}>
            <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.completeTask")}</h3>
            <input
              value={completionEvidence}
              onChange={(e) => setCompletionEvidence(e.target.value)}
              placeholder={t("genesisOs.completionEvidence")}
              className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
            />
            <button type="button" onClick={completeTask} className={`${cbaiBtnPrimary} min-h-10`}>
              {t("genesisOs.completeTask")}
            </button>
            <p className="text-[10px] text-zinc-600">{t("genesisOs.evidenceRequired")}</p>
          </div>

          <div className={`${cbaiGlassCard} space-y-3 p-4`}>
            <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.outcomeTitle")}</h3>
            <p className="text-[10px] text-zinc-600">{t("genesisOs.outputOutcomeImpactSeparation")}</p>
            <input value={outcomeTitle} onChange={(e) => setOutcomeTitle(e.target.value)} placeholder="Title" className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`} />
            <textarea value={outputDesc} onChange={(e) => setOutputDesc(e.target.value)} placeholder={t("genesisOs.outputDescription")} rows={2} className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`} />
            <textarea value={outcomeDesc} onChange={(e) => setOutcomeDesc(e.target.value)} placeholder={t("genesisOs.outcomeDescription")} rows={2} className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`} />
            <textarea value={impactClaim} onChange={(e) => setImpactClaim(e.target.value)} placeholder={t("genesisOs.impactClaim")} rows={2} className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`} />
            <input value={outcomeEvidence} onChange={(e) => setOutcomeEvidence(e.target.value)} placeholder={t("genesisOs.evidenceLabel")} className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`} />
            <button type="button" onClick={recordOutcome} className={`${cbaiBtnPrimary} min-h-10`}>{t("genesisOs.createOutcome")}</button>
            <button type="button" onClick={submitOutcomeReview} className={`${cbaiBtnPrimary} min-h-10`}>{t("genesisOs.submitOutcomeReview")}</button>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => reviewOutcome("Supported")} className={`${cbaiBtnPrimary} min-h-8 text-xs`}>{t("genesisOs.supportOutcome")}</button>
              <button type="button" onClick={() => reviewOutcome("Disputed")} className={`${cbaiBtnPrimary} min-h-8 text-xs`}>{t("genesisOs.disputeOutcome")}</button>
            </div>
            <input value={reviewReason} onChange={(e) => setReviewReason(e.target.value)} placeholder={t("genesisOs.reviewReason")} className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`} />
          </div>

          <div className={`${cbaiGlassCard} space-y-3 p-4`}>
            <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.contributionTitle")}</h3>
            <textarea value={contribClaim} onChange={(e) => setContribClaim(e.target.value)} placeholder="Claimed change" rows={2} className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`} />
            <button type="button" onClick={createClaim} className={`${cbaiBtnPrimary} min-h-10`}>{t("genesisOs.claimContribution")}</button>
            <button type="button" onClick={() => { const id = selectedContribId || contributions[contributions.length - 1]?.id; if (id) { submitContributionEvidence(id, [{ label: outcomeEvidence || "Evidence attached" }]); submitContributionForReview(id, operatorName); setFeedback(t("genesisOs.saved")); bump(); } }} className={`${cbaiBtnPrimary} min-h-10`}>{t("genesisOs.submitContributionReview")}</button>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => reviewContribution("Supported")} className={`${cbaiBtnPrimary} min-h-8 text-xs`}>Support</button>
              <button type="button" onClick={() => reviewContribution("Disputed")} className={`${cbaiBtnPrimary} min-h-8 text-xs`}>Dispute</button>
            </div>
            <p className="text-[10px] text-zinc-600">{t("genesisOs.noHeroCreation")}</p>
          </div>

          <div className={`${cbaiGlassCard} space-y-3 p-4`}>
            <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.recognitionWorkflowTitle")}</h3>
            <button type="button" onClick={draftRecognition} className={`${cbaiBtnPrimary} min-h-10`}>{t("genesisOs.draftRecognition")}</button>
            <button type="button" onClick={approveRecognition} className={`${cbaiBtnPrimary} min-h-10`}>{t("genesisOs.approveRecognition")}</button>
            <p className="text-[10px] text-zinc-600">{t("genesisOs.recognitionEvidenceRequired")}</p>
            {recognitions.slice(-2).map((r) => (
              <p key={r.id} className="text-xs text-zinc-400">{r.subject} · {r.status}</p>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-zinc-500">{t("genesisOs.chainEmpty")}</p>
      )}

      {feedback ? (
        <p className="text-xs text-teal-400/90" role="status">{feedback}</p>
      ) : null}
    </section>
  );
}
