"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import {
  createLivingResearchObject,
  addResearchResult,
  loadLivingResearchObjects,
  loadResearchResults,
} from "@/lib/genesis/living-research-object-store";
import {
  createOpportunity,
  createFundingNeed,
  deriveFundingReadinessGaps,
  explainOpportunityMatch,
  loadOpportunities,
  loadFundingNeeds,
} from "@/lib/genesis/opportunity-store";
import {
  createContributionClaim,
  updateContributionState,
  loadContributionClaims,
  loadRecognitionRecords,
} from "@/lib/genesis/contribution-store";
import { createCapabilityRecord, loadCapabilityRecords } from "@/lib/genesis/capability-records-store";
import { RESEARCH_RESULT_STATUSES } from "@/lib/genesis/genesis-types";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function GenesisWorkflowPanel() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const operatorName = resolveOperatorName(profile);
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);

  const [researchTitle, setResearchTitle] = useState("");
  const [researchQuestion, setResearchQuestion] = useState("");
  const [resultSummary, setResultSummary] = useState("");
  const [resultStatus, setResultStatus] = useState<(typeof RESEARCH_RESULT_STATUSES)[number]>("Negative Result");
  const [selectedObjectId, setSelectedObjectId] = useState("");
  const [oppTitle, setOppTitle] = useState("");
  const [oppProblem, setOppProblem] = useState("");
  const [fundingProblem, setFundingProblem] = useState("");
  const [contributionClaim, setContributionClaim] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const onChange = () => bump();
    window.addEventListener(MISSION_DATA_CHANGED, onChange);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChange);
  }, [bump]);

  const mission = useMemo(() => {
    void tick;
    return hydrated ? loadCurrentMission() : null;
  }, [hydrated, tick]);

  const researchObjects = useMemo(() => {
    void tick;
    return hydrated ? loadLivingResearchObjects() : [];
  }, [hydrated, tick]);

  const opportunities = useMemo(() => {
    void tick;
    return hydrated ? loadOpportunities() : [];
  }, [hydrated, tick]);

  const fundingNeeds = useMemo(() => {
    void tick;
    return hydrated ? loadFundingNeeds() : [];
  }, [hydrated, tick]);

  const contributions = useMemo(() => {
    void tick;
    return hydrated ? loadContributionClaims() : [];
  }, [hydrated, tick]);

  const recognition = useMemo(() => {
    void tick;
    return hydrated ? loadRecognitionRecords() : [];
  }, [hydrated, tick]);

  const capabilityRecords = useMemo(() => {
    void tick;
    return hydrated ? loadCapabilityRecords() : [];
  }, [hydrated, tick]);

  const matchExplanation = useMemo(() => {
    const opp = opportunities[0];
    if (!opp || !mission) return null;
    return explainOpportunityMatch(opp, {
      missionProblem: mission.problem,
      capabilitySummary: capabilityRecords.map((r) => r.label).join(", "),
    });
  }, [opportunities, mission, capabilityRecords]);

  if (!hydrated) return null;

  const addResearchObject = () => {
    if (!researchTitle.trim() || !researchQuestion.trim()) return;
    const obj = createLivingResearchObject({
      title: researchTitle.trim(),
      authorOwner: operatorName,
      researchQuestion: researchQuestion.trim(),
      hypothesis: "",
      domain: "microbiology",
      methods: "",
      limitations: "",
      openQuestions: "",
      missionId: mission?.id ?? null,
      projectId: mission?.projectId ?? null,
      researchTopicId: "microbiology",
      visibility: "private",
      ethicalReviewStatus: "not applicable",
      humanReviewStatus: "none",
      collaborationNeed: "",
      fundingNeed: "",
      evidenceRefs: [],
    });
    setSelectedObjectId(obj.id);
    setResearchTitle("");
    setResearchQuestion("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const addResult = () => {
    const objectId = selectedObjectId || researchObjects[researchObjects.length - 1]?.id;
    if (!objectId || !resultSummary.trim()) return;
    addResearchResult({
      objectId,
      summary: resultSummary.trim(),
      status: resultStatus,
      method: "User-recorded",
      source: "Local demonstration",
      limitation: "Not independently verified.",
      reasonForStatus: resultStatus,
      humanReviewer: operatorName,
    });
    setResultSummary("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const publishOpportunity = () => {
    if (!oppTitle.trim() || !oppProblem.trim()) return;
    createOpportunity({
      type: "Open Challenge",
      title: oppTitle.trim(),
      problem: oppProblem.trim(),
      organizationId: null,
      missionId: mission?.id ?? null,
      projectId: mission?.projectId ?? null,
      desiredOutcome: "",
      requiredEvidence: "Evidence required before selection.",
      requiredCapability: "",
      eligibility: "",
      scope: "",
      deadline: null,
      fundingRange: null,
      humanDecisionOwner: operatorName,
      visibility: "private",
      status: "Open",
    });
    setOppTitle("");
    setOppProblem("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const recordFundingNeed = () => {
    if (!fundingProblem.trim()) return;
    const draft = {
      missionId: mission?.id ?? null,
      projectId: mission?.projectId ?? null,
      livingResearchObjectId: selectedObjectId || researchObjects[0]?.id || null,
      problem: fundingProblem.trim(),
      evidenceStatus: "",
      stage: "Draft",
      teamSummary: "",
      requestedSupport: "",
      intendedUse: "",
      milestones: "",
      risks: "",
      limitations: "",
      humanityImpact: "",
      natureImpact: "",
      conflictDisclosure: "",
      readinessStatus: "Evidence Incomplete" as const,
    };
    const gaps = deriveFundingReadinessGaps(draft);
    createFundingNeed({ ...draft, readinessGaps: gaps });
    setFundingProblem("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const submitContribution = () => {
    if (!contributionClaim.trim()) return;
    const claim = createContributionClaim({
      missionId: mission?.id ?? null,
      projectId: mission?.projectId ?? null,
      organizationId: null,
      directiveId: null,
      claimedChange: contributionClaim.trim(),
      claimedBy: operatorName,
      evidenceRefs: [],
      otherFactors: "Multiple factors may contribute.",
      uncertainty: "Human review required.",
      state: "Claimed",
    });
    updateContributionState(claim.id, "Under Review", operatorName);
    setContributionClaim("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const addCapabilityRecord = () => {
    if (!mission) return;
    createCapabilityRecord({
      label: `Mission work: ${mission.problem.slice(0, 40)}`,
      description: "Evidence-backed capability from mission work.",
      methodsUsed: "",
      projectId: mission.projectId ?? null,
      missionId: mission.id,
      evidenceRefs: [],
      visibility: "private",
      limitations: "Unverified until evidence linked.",
      unresolvedQuestions: "",
    });
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const selectedResults = selectedObjectId
    ? loadResearchResults(selectedObjectId)
    : researchObjects[0]
      ? loadResearchResults(researchObjects[0].id)
      : [];

  return (
    <section className="space-y-4" aria-labelledby="genesis-workflow-heading">
      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>{t("genesisOs.eyebrow")}</p>
        <h2 id="genesis-workflow-heading" className="text-sm font-semibold text-zinc-100">
          Research · Opportunity · Funding · Contribution
        </h2>
        <p className="text-xs text-zinc-600">{t("genesisOs.matchHonest")}</p>
        <p className="text-xs text-zinc-600">{t("genesisOs.noFakeFunding")}</p>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.livingResearchTitle")}</h3>
        <p className="text-xs text-zinc-500">{t("genesisOs.livingResearchPurpose")}</p>
        <input
          value={researchTitle}
          onChange={(e) => setResearchTitle(e.target.value)}
          placeholder="Title"
          className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
        />
        <input
          value={researchQuestion}
          onChange={(e) => setResearchQuestion(e.target.value)}
          placeholder={t("genesisOs.researchQuestion")}
          className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
        />
        <button type="button" onClick={addResearchObject} className={`${cbaiBtnPrimary} min-h-10`}>
          {t("genesisOs.createResearchObject")}
        </button>
        {researchObjects.length > 0 ? (
          <>
            <select
              value={selectedObjectId}
              onChange={(e) => setSelectedObjectId(e.target.value)}
              className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
            >
              <option value="">Select object</option>
              {researchObjects.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
            <textarea
              value={resultSummary}
              onChange={(e) => setResultSummary(e.target.value)}
              placeholder={t("genesisOs.resultSummary")}
              rows={2}
              className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
            />
            <select
              value={resultStatus}
              onChange={(e) => setResultStatus(e.target.value as (typeof RESEARCH_RESULT_STATUSES)[number])}
              className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
            >
              {RESEARCH_RESULT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="button" onClick={addResult} className={`${cbaiBtnPrimary} min-h-10`}>
              {t("genesisOs.addResult")}
            </button>
            <p className="text-[10px] text-zinc-600">{t("genesisOs.negativeResultNotice")}</p>
            {selectedResults.length > 0 ? (
              <ul className="space-y-1 text-xs text-zinc-400">
                {selectedResults.map((r) => (
                  <li key={r.id}>
                    {r.status}: {r.summary}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </div>

      <div className={`${cbaiGlassCard} grid gap-4 p-4 lg:grid-cols-2`}>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.opportunityTitle")}</h3>
          <input
            value={oppTitle}
            onChange={(e) => setOppTitle(e.target.value)}
            placeholder="Title"
            className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
          />
          <textarea
            value={oppProblem}
            onChange={(e) => setOppProblem(e.target.value)}
            placeholder="Problem"
            rows={2}
            className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
          />
          <button type="button" onClick={publishOpportunity} className={`${cbaiBtnPrimary} min-h-10`}>
            {t("genesisOs.publishOpportunity")}
          </button>
          {matchExplanation ? (
            <div className="rounded border border-zinc-800 p-2 text-[10px] text-zinc-500">
              <p className="font-medium text-zinc-400">{t("genesisOs.matchExplanation")}</p>
              {matchExplanation.reasons.map((r) => (
                <p key={r}>{r}</p>
              ))}
              {matchExplanation.uncertainties.map((u) => (
                <p key={u} className="text-amber-400/80">
                  {u}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.fundingNeedTitle")}</h3>
          <textarea
            value={fundingProblem}
            onChange={(e) => setFundingProblem(e.target.value)}
            placeholder="Problem"
            rows={2}
            className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
          />
          <button type="button" onClick={recordFundingNeed} className={`${cbaiBtnPrimary} min-h-10`}>
            {t("genesisOs.createFundingNeed")}
          </button>
          {fundingNeeds[0]?.readinessGaps.length ? (
            <div>
              <p className="text-xs text-zinc-500">{t("genesisOs.readinessGaps")}</p>
              <ul className="list-disc pl-4 text-xs text-amber-300/90">
                {fundingNeeds[0].readinessGaps.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.contributionTitle")}</h3>
        <p className="text-[10px] text-zinc-600">{t("genesisOs.noHeroCreation")}</p>
        <textarea
          value={contributionClaim}
          onChange={(e) => setContributionClaim(e.target.value)}
          placeholder="Claimed change"
          rows={2}
          className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
        />
        <button type="button" onClick={submitContribution} className={`${cbaiBtnPrimary} min-h-10`}>
          {t("genesisOs.claimContribution")}
        </button>
        <button type="button" onClick={addCapabilityRecord} className={`${cbaiBtnPrimary} min-h-10`}>
          Add capability record
        </button>
        <p className="text-xs text-zinc-500">
          Contributions: {contributions.length} · Recognition: {recognition.length} · Capability records:{" "}
          {capabilityRecords.length}
        </p>
        <p className="text-[10px] text-zinc-600">{t("genesisOs.recognitionEvidenceRequired")}</p>
      </div>

      {feedback ? (
        <p className="text-xs text-teal-400/90" role="status">
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
