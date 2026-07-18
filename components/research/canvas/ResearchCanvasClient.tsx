"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import { createMission, linkMissionToProject } from "@/lib/intelligence-os/mission-store";
import { createProject } from "@/lib/project/project-store";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";
import { createLivingResearchObject } from "@/lib/genesis/living-research-object-store";
import { createFundingNeed, createOpportunity } from "@/lib/genesis/opportunity-store";
import {
  createSmartIdea,
  loadSmartIdeas,
  loadSmartIdea,
  addSmartIdeaArtifact,
  confirmExtractedItem,
  correctExtractedItem,
  rejectExtractedItem,
  buildIdeaModel,
  canBuildIdeaModel,
  addManualInterpretationDraft,
  confirmExternalSearch,
  linkSmartIdeaToMission,
  recordHumanDecision,
  getSanitizedSearchConcepts,
  revokeExternalSearch,
  setExternalSearchQueryOverride,
  updateSmartIdeaStage,
} from "@/lib/research-canvas/smart-idea-store";
import {
  createMeasurementPlan,
  createMeasurementPassport,
  loadMeasurementPlans,
  loadMeasurementPassports,
} from "@/lib/research-canvas/measurement-store";
import { convertUnits, buildConversionRecord } from "@/lib/research-canvas/unit-converter";
import { getUnit, UNIT_REGISTRY } from "@/lib/research-canvas/unit-registry";
import { runCalculation } from "@/lib/research-canvas/scientific-calculator";
import { METHOD_REGISTRY, VIRTUAL_INSTRUMENT_REGISTRY } from "@/lib/research-canvas/instrument-registry";
import { listOpenScienceProviders } from "@/lib/research-canvas/open-science-provider-registry";
import {
  searchOpenScienceForIdea,
  searchAllOpenScienceForIdea,
  loadDiscoveryResults,
  buildHistoricalTimeline,
  buildCurrentLandscape,
  compareIdeaToRecord,
} from "@/lib/research-canvas/research-discovery";
import { buildDecisionSupportPackage } from "@/lib/research-canvas/decision-support";
import {
  buildDecisionSupportReport,
} from "@/lib/research-canvas/research-canvas-reports";
import { parseMolecularFormula } from "@/lib/research-canvas/molecular-formula-analyzer";
import { deriveCanvasStageStatuses, deriveActiveStageNextAction } from "@/lib/research-canvas/canvas-stage-status";
import { CANVAS_STAGES, prerequisiteStageFor, stagePanelId } from "@/lib/research-canvas/canvas-stage-navigation";
import {
  actionCopyKey,
  blockedCopyKey,
  persistenceCopyKey,
  stageCopyKey,
  stagePurposeCopyKey,
  statusCopyKey,
} from "@/lib/research-canvas/canvas-stage-i18n";
import { loadMission } from "@/lib/intelligence-os/mission-store";
import InterpretationReviewCard from "@/components/research/canvas/InterpretationReviewCard";
import ManualInterpretationInputPanel from "@/components/research/canvas/ManualInterpretationInputPanel";
import { manualInterpretationDraftStore } from "@/lib/research-canvas/manual-interpretation-draft";
import { buildExternalSearchConsent, IP_BOUNDARY_NOTICE, visibilityEnforcementNote } from "@/lib/research-canvas/privacy-boundary";
import { resolvePersistenceMode } from "@/lib/product/persistence-mode";
import { appendGenesisOperatingParamsToHref } from "@/lib/genesis/genesis-operating-context";
import { createExecutionTask } from "@/lib/genesis/execution-store";
import type { ResearchCanvasStage } from "@/lib/research-canvas/research-canvas-types";
import {
  cbaiBtnPrimary,
  cbaiFocusRing,
  cbaiGlassCard,
  cbaiMineralSurface,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

function defaultTaskDeadlineIso(daysFromNow: number): string {
  return new Date(Date.now() + daysFromNow * 86400000).toISOString().slice(0, 10);
}

export default function ResearchCanvasClient() {
  const { t } = useTranslation();
  const rc = (key: string) => t(`researchCanvas.${key}`);
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const operator = resolveOperatorName(profile);
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);
  const stagePanelRef = useRef<HTMLElement | null>(null);
  const manualDraftIdeaRef = useRef<string | null>(null);
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [stage, setStage] = useState<ResearchCanvasStage>("IDEA");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [purpose, setPurpose] = useState("");

  const [measurand, setMeasurand] = useState("");
  const [unitId, setUnitId] = useState("m");
  const [methodId, setMethodId] = useState("manual-entry");
  const [calibration, setCalibration] = useState("");
  const [measureResult, setMeasureResult] = useState("");
  const [rawDataRef, setRawDataRef] = useState("");
  const [uncertainty, setUncertainty] = useState("");

  const [convValue, setConvValue] = useState("100");
  const [convFrom, setConvFrom] = useState("cm");
  const [convTo, setConvTo] = useState("m");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [molecularFormula, setMolecularFormula] = useState("H2O");

  const [refPixels, setRefPixels] = useState("100");
  const [refReal, setRefReal] = useState("10");
  const [pixelLength, setPixelLength] = useState("250");

  const [executeTaskTitle, setExecuteTaskTitle] = useState("");
  const [sanitizedQueryEdit, setSanitizedQueryEdit] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [interpretFocus, setInterpretFocus] = useState<"upload" | "manual" | null>(null);

  const urlSmartIdeaId = searchParams.get("smartIdea");
  const resolvedActiveId = activeId ?? urlSmartIdeaId;

  useEffect(() => {
    const onChange = () => bump();
    window.addEventListener(MISSION_DATA_CHANGED, onChange);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChange);
  }, [bump]);

  const ideas = useMemo(() => {
    void tick;
    return hydrated ? loadSmartIdeas() : [];
  }, [hydrated, tick]);

  const idea = useMemo(() => {
    void tick;
    if (!hydrated || !resolvedActiveId) return null;
    return loadSmartIdea(resolvedActiveId);
  }, [hydrated, resolvedActiveId, tick]);

  const discoveries = useMemo(() => {
    void tick;
    return idea ? loadDiscoveryResults(idea.id) : [];
  }, [idea, tick]);

  const [decisionPath, setDecisionPath] = useState("");
  const [decisionReason, setDecisionReason] = useState("");

  const stageStatuses = useMemo(() => deriveCanvasStageStatuses(idea), [idea]);
  const nextActionKey = useMemo(() => deriveActiveStageNextAction(idea), [idea]);
  const persistenceNote = rc(persistenceCopyKey(resolvePersistenceMode()));
  const linkedMission = useMemo(() => (idea?.missionId ? loadMission(idea.missionId) : null), [idea]);
  const ideaModelGate = idea ? canBuildIdeaModel(idea) : null;

  useEffect(() => {
    if (!idea?.id) return;
    if (manualDraftIdeaRef.current === idea.id) return;
    manualDraftIdeaRef.current = idea.id;
    setManualDescription(manualInterpretationDraftStore.read(idea.id));
    setInterpretFocus(null);
  }, [idea?.id]);

  const selectStage = (target: ResearchCanvasStage) => {
    const changed = stage !== target;
    setStage(target);
    if (idea && changed) updateSmartIdeaStage(idea.id, target);
    if (!changed) return;
    requestAnimationFrame(() => {
      stagePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const decisionSectionLabel = (key: "facts" | "options" | "unknown" | "requiredValidation") => {
    const map = {
      facts: t("researchCanvas.factsLabel"),
      options: t("researchCanvas.optionsLabel"),
      unknown: t("researchCanvas.unknownLabel"),
      requiredValidation: t("researchCanvas.requiredValidationLabel"),
    } as const;
    return map[key];
  };

  const contextHref = (path: string) => {
    if (!idea) return path;
    return appendGenesisOperatingParamsToHref(path, {
      missionId: idea.missionId ?? undefined,
      projectId: idea.projectId ?? undefined,
      smartIdeaId: idea.id,
      researchObjectId: idea.livingResearchObjectId ?? undefined,
    });
  };

  const createIdea = () => {
    if (!title.trim() || !problem.trim()) return;
    const created = createSmartIdea({
      title,
      originalDescription: description,
      problem,
      purpose,
      owner: operator,
      visibility: "Private",
    });
    setActiveId(created.id);
    selectStage("IDEA");
    setFeedback(t("researchCanvas.savedPrivate"));
    bump();
  };

  const onFileSelected = async (file: File) => {
    if (!idea) return;
    const kind = file.type.includes("svg") ? "svg" : file.type.startsWith("image/") ? "image" : file.type.includes("pdf") ? "pdf" : "text";
    let textContent: string | null = null;
    let pixelWidth: number | null = null;
    let pixelHeight: number | null = null;
    if (kind === "svg") textContent = await file.text();
    if (kind === "image") {
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          pixelWidth = img.naturalWidth;
          pixelHeight = img.naturalHeight;
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = url;
      });
    }
    addSmartIdeaArtifact(idea.id, {
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      kind,
      textContent,
      pixelWidth,
      pixelHeight,
    });
    selectStage("INTERPRET");
    setFeedback(t("researchCanvas.artifactAnalyzed"));
    bump();
  };

  const confirmItem = (itemId: string) => {
    if (!idea) return;
    confirmExtractedItem(idea.id, itemId, { status: "Confirmed", actor: operator });
    setFeedback(t("researchCanvas.confirmed"));
    bump();
  };

  const correctItem = (itemId: string, value: string) => {
    if (!idea) return;
    correctExtractedItem(idea.id, itemId, { correctedValue: value, actor: operator });
    setFeedback(t("researchCanvas.interpretCorrectionSaved"));
    bump();
  };

  const rejectItem = (itemId: string, reason: string) => {
    if (!idea) return;
    rejectExtractedItem(idea.id, itemId, { reason, actor: operator });
    setFeedback(t("researchCanvas.interpretRejected"));
    bump();
  };

  const createModel = () => {
    if (!idea) return;
    const gate = canBuildIdeaModel(idea);
    if (!gate.ok) {
      setFeedback(t("researchCanvas.confirmBeforeIdeaModel"));
      return;
    }
    buildIdeaModel(idea.id, {
      researchQuestions: [problem],
      humanityBenefit: purpose,
      requiredValidation: ["Calibration documented", "Raw data reference"],
    });
    setStage("MEASURE");
    setFeedback(t("researchCanvas.ideaModelCreated"));
    bump();
  };

  const addPlan = () => {
    if (!idea || !measurand.trim()) return;
    createMeasurementPlan({
      smartIdeaId: idea.id,
      measurand,
      purpose: purpose || idea.purpose,
      domain: idea.domain,
      sampleOrObject: idea.title,
      methodId,
      instrumentId: METHOD_REGISTRY.find((m) => m.id === methodId)?.instrumentId ?? "manual-entry",
      unitId,
      calibration,
      referenceStandard: "",
      conditions: "",
      rawDataReference: rawDataRef,
      processingModel: "",
      uncertaintyNote: uncertainty,
      validationNote: "",
      humanReviewRequired: true,
    });
    setFeedback(t("researchCanvas.planCreated"));
    bump();
  };

  const addPassport = () => {
    if (!idea) return;
    const p = createMeasurementPassport({
      smartIdeaId: idea.id,
      measuredObject: idea.title,
      measurand: measurand || "length",
      result: measureResult,
      unit: getUnit(unitId)?.symbol ?? unitId,
      uncertainty,
      uncertaintyType: "manual",
      uncertaintyLimitation: uncertainty ? "" : "Explicit uncertainty limitation required if value unknown.",
      methodId,
      instrumentId: "image-measurement-tool",
      instrumentModel: "manual",
      calibrationStatus: calibration ? "user-defined" : "missing",
      referenceStandard: calibration,
      rawDataReference: rawDataRef,
      processingSoftware: "cbai-research-canvas",
      algorithmVersion: "1.0",
      environmentalConditions: "",
      operator,
      laboratory: "device-local",
      limitations: "Manual or calibrated image measurement — approximate unless metrology documented.",
      reproducibilityStatus: "not replicated",
    });
    setFeedback(p ? t("researchCanvas.passportCreated") : t("researchCanvas.passportGateFailed"));
    bump();
  };

  const runConvert = () => {
    if (!idea) return;
    const result = convertUnits({
      value: Number(convValue),
      fromUnitId: convFrom,
      toUnitId: convTo,
      smartIdeaId: idea.id,
    });
    if (!result.ok) {
      setFeedback(result.reason);
      return;
    }
    buildConversionRecord(result.record);
    setFeedback(`${result.convertedValue} ${convTo} (${result.formula})`);
    bump();
  };

  const runGeometryCalc = () => {
    if (!idea) return;
    const calc = runCalculation({
      smartIdeaId: idea.id,
      formulaId: "pixel-distance",
      variables: {
        pixelLength: Number(pixelLength),
        referenceReal: Number(refReal),
        referencePixels: Number(refPixels),
      },
      variableUnits: { pixelLength: "px", referenceReal: "cm", referencePixels: "px" },
    });
    setFeedback(calc.ok ? `Distance: ${calc.record.result} (see units in record)` : calc.reason);
    bump();
  };

  const decisionPkg = useMemo(() => (idea ? buildDecisionSupportPackage(idea) : null), [idea]);

  const runSearchAll = async () => {
    if (!idea) return;
    if (!idea.externalSearchConfirmed || idea.externalSearchRevoked) {
      setFeedback(t("researchCanvas.confirmSearchFirst"));
      return;
    }
    setFeedback(t("researchCanvas.searching"));
    const res = await searchAllOpenScienceForIdea({
      idea,
      keyword: searchKeyword || sanitizedQueryEdit,
      externalSearchConfirmed: true,
    });
    setStage("DISCOVER");
    setFeedback(
      res.records.length > 0
        ? `${res.records.length} unique record(s) from ${res.providerStates.filter((p) => p.count > 0).length} provider(s).`
        : res.limitations.slice(0, 2).join(" "),
    );
    bump();
  };

  const addExecuteTask = () => {
    if (!idea?.missionId || !executeTaskTitle.trim()) return;
    const deadline = defaultTaskDeadlineIso(14);
    createExecutionTask({
      planId: "research-canvas-adhoc",
      directiveId: "research-canvas-adhoc",
      organizationId: "device-local",
      missionId: idea.missionId,
      projectId: idea.projectId ?? null,
      title: executeTaskTitle.trim(),
      assignee: operator,
      accountableOwner: operator,
      collaborators: [],
      priority: "medium",
      deadline,
      status: "Active",
      expectedResult: executeTaskTitle.trim(),
      evidenceRequirement: "Document completion evidence before marking complete.",
      progressNote: "",
      approvalState: "none",
    });
    notifyMissionDataChanged("task");
    setFeedback(t("researchCanvas.executeTaskCreated"));
    bump();
  };

  const createManualDraft = () => {
    if (!idea) return;
    const trimmed = manualDescription.trim();
    if (trimmed.length < 30) {
      setFeedback(t("researchCanvas.manualDescriptionTooShort"));
      return;
    }
    addManualInterpretationDraft(idea.id, trimmed, operator);
    manualInterpretationDraftStore.clear(idea.id);
    setManualDescription("");
    setInterpretFocus(null);
    setFeedback(t("researchCanvas.draftInterpretationCreated"));
    if (stage !== "INTERPRET") selectStage("INTERPRET");
    bump();
  };

  const runSearch = async () => {
    if (!idea) return;
    if (!idea.externalSearchConfirmed || idea.externalSearchRevoked) {
      setFeedback(t("researchCanvas.confirmSearchFirst"));
      return;
    }
    setFeedback(t("researchCanvas.searching"));
    const res = await searchOpenScienceForIdea({
      idea,
      keyword: searchKeyword || sanitizedQueryEdit,
      externalSearchConfirmed: true,
    });
    setStage("DISCOVER");
    setFeedback(
      res.records.length > 0
        ? `${res.records.length} record(s) — ${res.connectionState}`
        : res.limitations.join(" "),
    );
    bump();
  };

  const createMissionFromIdea = () => {
    if (!idea) return;
    const project = createProject({
      title: idea.title.slice(0, 120),
      type: "research_project",
      description: idea.problem,
      tags: [],
      visibility: "private",
      status: "active",
      researchQuestion: idea.problem,
    });
    const mission = createMission({
      problem: idea.problem,
      whyExists: idea.purpose,
      whoBenefits: idea.intendedBeneficiary,
      whoCouldBeHarmed: "",
      evidenceHave: "",
      evidenceMissing: "Measurement and open-science evidence pending.",
      disciplines: [idea.domain],
      capabilitiesNeeded: "",
      environmentalImpact: idea.ideaModel?.natureImpact ?? "",
      successCriteria: idea.expectedResult,
      projectId: project.id,
    });
    linkMissionToProject(mission.id, project.id);
    notifyMissionDataChanged("project");
    const lro = createLivingResearchObject({
      title: idea.title,
      authorOwner: operator,
      researchQuestion: idea.problem,
      hypothesis: idea.purpose,
      domain: idea.domain,
      methods: methodId,
      limitations: "Created from Smart Idea — evidence in progress.",
      openQuestions: idea.ideaModel?.unknowns.join("; ") ?? "",
      missionId: mission.id,
      projectId: project.id,
      visibility: "private",
      ethicalReviewStatus: "none",
      humanReviewStatus: "none",
      collaborationNeed: "",
      fundingNeed: "",
      evidenceRefs: [],
    });
    linkSmartIdeaToMission(idea.id, {
      missionId: mission.id,
      projectId: project.id,
      livingResearchObjectId: lro.id,
    });
    createFundingNeed({
      missionId: mission.id,
      projectId: project.id,
      livingResearchObjectId: lro.id,
      problem: idea.problem,
      evidenceStatus: "Incomplete",
      stage: "idea",
      teamSummary: operator,
      requestedSupport: "",
      intendedUse: "",
      milestones: "",
      risks: "",
      limitations: "Draft funding need from Research Canvas.",
      humanityImpact: idea.ideaModel?.humanityBenefit ?? "",
      natureImpact: idea.ideaModel?.natureImpact ?? "",
      conflictDisclosure: "",
      readinessStatus: "Evidence Incomplete",
      readinessGaps: ["Evidence incomplete for human review."],
    });
    createOpportunity({
      type: "Research Collaboration",
      title: `Collaboration: ${idea.title}`,
      problem: idea.problem,
      desiredOutcome: idea.expectedResult,
      requiredEvidence: "Measurement passports and open-science references",
      requiredCapability: idea.domain,
      eligibility: "Open",
      scope: "Research Canvas",
      humanDecisionOwner: operator,
      visibility: "private",
      status: "Draft",
      missionId: mission.id,
      projectId: project.id,
    });
    setStage("MISSION");
    setFeedback(t("researchCanvas.missionCreated"));
    bump();
  };

  const saveDecision = () => {
    if (!idea || !decisionPath.trim()) return;
    recordHumanDecision(idea.id, { selectedPath: decisionPath, reason: decisionReason, actor: operator });
    setFeedback(t("researchCanvas.decisionRecorded"));
    bump();
  };

  const renderBlockedBanner = (targetStage: ResearchCanvasStage) => {
    const status = stageStatuses.find((s) => s.stage === targetStage);
    if (!status?.blockedReasonKey && !status?.blockedReason) return null;
    const prereq = prerequisiteStageFor(targetStage, status);
    return (
      <div
        role="alert"
        className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4 text-sm"
      >
        <p className="font-semibold text-amber-300">{t("researchCanvas.blockedStageTitle")}</p>
        <p className="mt-1 text-zinc-300">
          {status.blockedReasonKey
            ? rc(blockedCopyKey(status.blockedReasonKey))
            : status.blockedReason}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {t("researchCanvas.nextActionLabel")}: {rc(actionCopyKey(status.nextActionKey))}
        </p>
        {prereq && prereq !== targetStage ? (
          <button
            type="button"
            className={`${cbaiBtnPrimary} mt-3`}
            onClick={() => selectStage(prereq)}
          >
            {t("researchCanvas.goToPrerequisite")} — {rc(stageCopyKey(prereq))}
          </button>
        ) : null}
      </div>
    );
  };

  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-4">
      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>{t("researchCanvas.eyebrow")}</p>
        <p className="text-sm text-zinc-400">{t("researchCanvas.deviceLocal")}</p>
        <p className="text-xs text-zinc-600">{t("researchCanvas.humanDecision")}</p>
        <p className="text-xs text-zinc-500">{persistenceNote}</p>
        {idea ? (
          <p className="text-xs text-teal-400/90">
            {t("researchCanvas.nextActionLabel")}: {rc(actionCopyKey(nextActionKey))}
          </p>
        ) : null}
      </div>

      {idea ? (
        <div className={`${cbaiGlassCard} p-4 text-sm`}>
          <p className="text-xs font-semibold text-zinc-400">{t("researchCanvas.activeSmartIdea")}</p>
          <p className="font-medium text-zinc-100">{idea.title}</p>
          <p className="text-xs text-zinc-500">{idea.problem}</p>
          {linkedMission ? (
            <p className="mt-2 text-xs text-teal-400/90">
              {t("researchCanvas.missionBannerLabel")}: {linkedMission.problem}
            </p>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">{t("researchCanvas.noMissionBanner")}</p>
          )}
        </div>
      ) : null}

      {!resolvedActiveId ? (
        <section className={`${cbaiGlassCard} space-y-4 p-6`}>
          <h2 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.smartIdeaIntake")}</h2>
          <p className="text-xs text-zinc-500">{t("researchCanvas.defaultPrivate")}</p>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("researchCanvas.title")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("researchCanvas.description")} className={`${cbaiFocusRing} min-h-20 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
          <input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder={t("researchCanvas.problem")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={t("researchCanvas.purposeField")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
          <button type="button" onClick={createIdea} className={cbaiBtnPrimary}>{t("researchCanvas.createSmartIdea")}</button>
        </section>
      ) : null}

      {ideas.length > 0 ? (
        <details className={`${cbaiGlassCard} p-3 text-xs text-zinc-400`}>
          <summary className="cursor-pointer text-zinc-300">{t("researchCanvas.switchSmartIdea")}</summary>
          <ul className="mt-2 space-y-1">
            {ideas.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  className={`${cbaiFocusRing} text-teal-400 hover:text-teal-300`}
                  onClick={() => { setActiveId(i.id); selectStage(i.stage); setInterpretFocus(null); }}
                >
                  {i.title} — {rc(stageCopyKey(i.stage))}
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div
        role="tablist"
        aria-label={t("researchCanvas.stageNavAria")}
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
      >
        {CANVAS_STAGES.map((s) => {
          const st = stageStatuses.find((x) => x.stage === s);
          const selected = stage === s;
          const disabled = !idea && s !== "IDEA";
          return (
            <button
              key={s}
              type="button"
              role="tab"
              id={`stage-tab-${s}`}
              aria-selected={selected}
              aria-controls={stagePanelId(s)}
              disabled={disabled}
              onClick={() => selectStage(s)}
              className={`${cbaiFocusRing} rounded-lg border px-3 py-2 text-left text-xs transition ${
                selected
                  ? "border-teal-700/60 bg-teal-950/30 text-teal-200"
                  : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700"
              } ${disabled ? "opacity-50" : ""}`}
            >
              <span className="block font-semibold">{rc(stageCopyKey(s))}</span>
              {st ? (
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  {rc(statusCopyKey(st.status))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {idea ? (
        <section
          ref={stagePanelRef}
          id={stagePanelId(stage)}
          role="tabpanel"
          aria-labelledby={`stage-tab-${stage}`}
          className={`${stage === "INTERPRET" ? cbaiMineralSurface : cbaiGlassCard} relative isolate space-y-4 p-6`}
        >
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">{rc(stageCopyKey(stage))}</h2>
            <p className="text-xs text-zinc-500">{rc(stagePurposeCopyKey(stage))}</p>
          </div>
          {renderBlockedBanner(stage)}

          {stage === "IDEA" && (
            <>
              <p className="text-xs text-zinc-400">{t("researchCanvas.ideaSummary")}: {idea.title}</p>
              <h3 className="text-sm font-medium text-zinc-300">{t("researchCanvas.artifactUpload")}</h3>
              <input ref={fileRef} type="file" accept="image/*,.svg,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFileSelected(f); }} />
              <button type="button" onClick={() => fileRef.current?.click()} className={cbaiBtnPrimary}>{t("researchCanvas.uploadArtifact")}</button>
              <p className="text-xs text-zinc-500">{t("researchCanvas.supportedFileTypes")}</p>
              <p className="text-xs text-zinc-500">{t("researchCanvas.ocrUnavailable")}</p>
            </>
          )}

          {stage === "INTERPRET" && (
            <>
              {idea.extractedItems.length === 0 ? (
                <div className="space-y-3 rounded-lg border border-zinc-800 p-4">
                  <p className="font-medium text-zinc-200">{t("researchCanvas.interpretRequiresEvidence")}</p>
                  <p className="text-xs text-zinc-500">{t("researchCanvas.supportedFileTypes")}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={cbaiBtnPrimary}
                      onClick={() => { selectStage("IDEA"); setInterpretFocus("upload"); fileRef.current?.click(); }}
                    >
                      {t("researchCanvas.interpretOptionUpload")}
                    </button>
                    <button
                      type="button"
                      className={`${cbaiFocusRing} rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-300`}
                      onClick={() => setInterpretFocus("manual")}
                    >
                      {t("researchCanvas.interpretOptionManual")}
                    </button>
                  </div>
                  <ManualInterpretationInputPanel
                    smartIdeaId={idea.id}
                    open={interpretFocus === "manual" || manualDescription.length > 0}
                    value={manualDescription}
                    onValueChange={(next) => {
                      manualInterpretationDraftStore.write(idea.id, next);
                      setManualDescription(next);
                    }}
                    label={t("researchCanvas.manualDescriptionLabel")}
                    placeholder={t("researchCanvas.manualDescriptionPlaceholder")}
                    validationMessage={t("researchCanvas.manualDescriptionTooShort")}
                    submitLabel={t("researchCanvas.createDraftInterpretation")}
                    onSubmit={createManualDraft}
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.interpretationReview")}</h3>
                  <p className="text-sm text-zinc-300">{t("researchCanvas.confirmPrompt")}</p>
                  <p className="text-xs text-zinc-500">{t("researchCanvas.interpretManualInputNotice")}</p>
                  {idea.extractedItems.map((item) => (
                    <InterpretationReviewCard
                      key={item.id}
                      item={item}
                      rc={rc}
                      onConfirm={confirmItem}
                      onCorrect={correctItem}
                      onReject={rejectItem}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={createModel}
                    className={cbaiBtnPrimary}
                    disabled={!ideaModelGate?.ok}
                  >
                    {t("researchCanvas.buildIdeaModel")}
                  </button>
                  {!ideaModelGate?.ok && ideaModelGate ? (
                    <ul className="list-disc pl-4 text-xs text-amber-400/90">
                      {ideaModelGate.reasonKeys.map((key) => (
                        <li key={key}>{rc(`ideaModelGate_${key}`)}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
            </>
          )}

          {stage === "MEASURE" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.measurementPlan")}</h3>
                <input value={measurand} onChange={(e) => setMeasurand(e.target.value)} placeholder={t("researchCanvas.measurandPlaceholder")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}>
                  {UNIT_REGISTRY.filter((u) => u.conversionSupported).map((u) => (
                    <option key={u.id} value={u.id}>{u.symbol} — {u.name}</option>
                  ))}
                </select>
                <select value={methodId} onChange={(e) => setMethodId(e.target.value)} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}>
                  {METHOD_REGISTRY.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.capabilityState})</option>
                  ))}
                </select>
                <input value={calibration} onChange={(e) => setCalibration(e.target.value)} placeholder={t("researchCanvas.calibrationPlaceholder")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                <button type="button" onClick={addPlan} className={cbaiBtnPrimary}>{t("researchCanvas.createPlan")}</button>
              </section>
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.unitConverter")}</h3>
                <div className="flex gap-2">
                  <input value={convValue} onChange={(e) => setConvValue(e.target.value)} className={`${cbaiFocusRing} w-20 rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-2 text-sm`} />
                  <select value={convFrom} onChange={(e) => setConvFrom(e.target.value)} className={`${cbaiFocusRing} rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-2 text-sm`}>
                    {UNIT_REGISTRY.map((u) => <option key={u.id} value={u.id}>{u.symbol}</option>)}
                  </select>
                  <span className="self-center text-zinc-500">→</span>
                  <select value={convTo} onChange={(e) => setConvTo(e.target.value)} className={`${cbaiFocusRing} rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-2 text-sm`}>
                    {UNIT_REGISTRY.map((u) => <option key={u.id} value={u.id}>{u.symbol}</option>)}
                  </select>
                </div>
                <button type="button" onClick={runConvert} className={cbaiBtnPrimary}>{t("researchCanvas.convert")}</button>
              </section>
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.imageMeasurementPreview")}</h3>
                <input value={refPixels} onChange={(e) => setRefPixels(e.target.value)} placeholder={t("researchCanvas.referencePixelsPlaceholder")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                <input value={refReal} onChange={(e) => setRefReal(e.target.value)} placeholder={t("researchCanvas.referenceRealPlaceholder")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                <input value={pixelLength} onChange={(e) => setPixelLength(e.target.value)} placeholder={t("researchCanvas.pixelLengthPlaceholder")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                <button type="button" onClick={runGeometryCalc} className={cbaiBtnPrimary}>{t("researchCanvas.calculateDistance")}</button>
              </section>
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.measurementPassport")}</h3>
                <input value={measureResult} onChange={(e) => setMeasureResult(e.target.value)} placeholder={t("researchCanvas.resultValuePlaceholder")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                <input value={rawDataRef} onChange={(e) => setRawDataRef(e.target.value)} placeholder={t("researchCanvas.rawDataPlaceholder")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                <input value={uncertainty} onChange={(e) => setUncertainty(e.target.value)} placeholder={t("researchCanvas.uncertaintyPlaceholder")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                <button type="button" onClick={addPassport} className={cbaiBtnPrimary}>{t("researchCanvas.createPassport")}</button>
                <p className="text-xs text-zinc-500">{loadMeasurementPassports(idea.id).length} {t("researchCanvas.passports").toLowerCase()}</p>
              </section>
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.molecularFormula")}</h3>
                <input value={molecularFormula} onChange={(e) => setMolecularFormula(e.target.value)} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                <pre className="text-xs text-zinc-400">{JSON.stringify(parseMolecularFormula(molecularFormula), null, 2)}</pre>
              </section>
            </div>
          )}

          {stage === "DISCOVER" && (
            <>
              <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.researchDiscovery")}</h3>
              <p className="text-xs text-zinc-500">{visibilityEnforcementNote(idea.visibility)}</p>
              <p className="text-xs text-zinc-500">{IP_BOUNDARY_NOTICE}</p>
              <p className="text-xs text-zinc-500">
                {buildExternalSearchConsent(idea).confirmed
                  ? t("researchCanvas.externalSearchAuthorized")
                  : t("researchCanvas.externalSearchNotAuthorized")}
              </p>
              <p className="text-xs text-zinc-500">{t("researchCanvas.sanitizedConcepts")}: {getSanitizedSearchConcepts(idea).join(" · ")}</p>
              <input
                value={sanitizedQueryEdit}
                onChange={(e) => {
                  setSanitizedQueryEdit(e.target.value);
                  setExternalSearchQueryOverride(idea.id, e.target.value);
                  bump();
                }}
                placeholder={t("researchCanvas.editSanitizedQuery")}
                className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
              />
              {!idea.externalSearchConfirmed || idea.externalSearchRevoked ? (
                <button
                  type="button"
                  onClick={() => {
                    confirmExternalSearch(idea.id, operator, { queryOverride: sanitizedQueryEdit || undefined });
                    bump();
                    setFeedback(t("researchCanvas.searchConfirmed"));
                  }}
                  className={cbaiBtnPrimary}
                >
                  {t("researchCanvas.confirmExternalSearch")}
                </button>
              ) : (
                <>
                  <input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder={t("researchCanvas.searchKeyword")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void runSearch()} className={cbaiBtnPrimary}>{t("researchCanvas.searchCrossref")}</button>
                    <button type="button" onClick={() => void runSearchAll()} className={cbaiBtnPrimary}>{t("researchCanvas.searchAllProviders")}</button>
                    <button type="button" onClick={() => { revokeExternalSearch(idea.id, operator); bump(); setFeedback(t("researchCanvas.revokeConsent")); }} className={`${cbaiFocusRing} text-xs text-amber-400`}>{t("researchCanvas.revokeConsent")}</button>
                  </div>
                </>
              )}
              <ul className="space-y-2 text-xs text-zinc-400">
                {listOpenScienceProviders().map((p) => (
                  <li key={p.id}>{p.name}: {p.connectionStatus}</li>
                ))}
              </ul>
              {discoveries.map((d) => (
                <div key={d.id} className="rounded border border-zinc-800 p-2">
                  <p className="text-zinc-200">{d.title}</p>
                  <p>{d.authors.join(", ")} · {d.date} · {d.projectStatus}</p>
                </div>
              ))}
              <h3 className="text-xs font-semibold text-zinc-300">{t("researchCanvas.timeline")}</h3>
              <ul className="text-xs text-zinc-500">
                {buildHistoricalTimeline(idea.id).map((row) => (
                  <li key={row.id}>{row.date}: {row.title}</li>
                ))}
              </ul>
            </>
          )}

          {stage === "COMPARE" && (
            <>
              <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.comparison")}</h3>
              {discoveries.slice(0, 3).map((d) => {
                const c = compareIdeaToRecord(idea, d);
                return (
                  <div key={d.id} className="rounded border border-zinc-800 p-3 text-xs">
                    <p className="font-medium text-zinc-200">{d.title}</p>
                    <p className="text-teal-400/90">{c.similarities.join("; ")}</p>
                    <p className="text-zinc-400">{c.differences.join("; ")}</p>
                    <p className="text-amber-400/80">{c.patentNote}</p>
                  </div>
                );
              })}
              <h3 className="text-xs font-semibold">{t("researchCanvas.landscape")}</h3>
              <ul className="text-xs text-zinc-500">
                {buildCurrentLandscape(idea.id).map((l, i) => (
                  <li key={i}>{l.kind}: {l.label} — {l.limitation}</li>
                ))}
              </ul>
            </>
          )}

          {stage === "MISSION" && (
            <>
              <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.missionBuilder")}</h3>
              <p className="text-xs text-zinc-500">{t("researchCanvas.missionNote")}</p>
              <button type="button" onClick={createMissionFromIdea} className={cbaiBtnPrimary}>{t("researchCanvas.createResearchMission")}</button>
              {idea.missionId ? (
                <Link href={contextHref(`/my-work?mission=${idea.missionId}`)} className={`${cbaiFocusRing} text-xs text-teal-400`}>{t("researchCanvas.openMission")} →</Link>
              ) : null}
            </>
          )}

          {stage === "EXECUTE" && (
            <>
              <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.executeTitle")}</h3>
              {!idea.missionId ? (
                <p className="text-xs text-amber-400/90">{t("researchCanvas.executeNeedsMission")}</p>
              ) : (
                <>
                  <input
                    value={executeTaskTitle}
                    onChange={(e) => setExecuteTaskTitle(e.target.value)}
                    placeholder={t("researchCanvas.executeTaskPlaceholder")}
                    className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
                  />
                  <button type="button" onClick={addExecuteTask} className={cbaiBtnPrimary}>{t("researchCanvas.executeCreateTask")}</button>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <Link href={contextHref(`/my-work?mission=${idea.missionId}`)} className={`${cbaiFocusRing} text-teal-400`}>My Work →</Link>
                    <Link href={contextHref("/reasoning")} className={`${cbaiFocusRing} text-teal-400`}>Reasoning →</Link>
                    <Link href={contextHref("/reports")} className={`${cbaiFocusRing} text-teal-400`}>Reports →</Link>
                  </div>
                </>
              )}
            </>
          )}

          {stage === "DECIDE" && decisionPkg && (
            <>
              <h3 className="text-sm font-semibold text-zinc-200">{t("researchCanvas.decisionSupport")}</h3>
              {(["facts", "options", "unknown", "requiredValidation"] as const).map((key) => (
                <div key={key}>
                  <p className="text-xs font-semibold uppercase text-zinc-500">{decisionSectionLabel(key)}</p>
                  <ul className="list-disc pl-4 text-xs text-zinc-400">
                    {decisionPkg[key].map((line) => <li key={line}>{line}</li>)}
                  </ul>
                </div>
              ))}
              <p className="text-xs text-amber-400/90">{decisionPkg.humanDecisionBoundary}</p>
              <input value={decisionPath} onChange={(e) => setDecisionPath(e.target.value)} placeholder={t("researchCanvas.selectedPath")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
              <input value={decisionReason} onChange={(e) => setDecisionReason(e.target.value)} placeholder={t("researchCanvas.decisionReason")} className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`} />
              <button type="button" onClick={saveDecision} className={cbaiBtnPrimary}>{t("researchCanvas.recordDecision")}</button>
              <button type="button" onClick={() => setFeedback(buildDecisionSupportReport(idea).kind)} className={`${cbaiFocusRing} text-xs text-teal-400`}>{t("researchCanvas.generateReport")}</button>
            </>
          )}
        </section>
      ) : null}

      {idea ? (
        <section className={`${cbaiGlassCard} p-4 text-xs text-zinc-500`}>
          <p>{t("researchCanvas.instruments")}: {VIRTUAL_INSTRUMENT_REGISTRY.filter((i) => i.capabilityState === "Working").length} working / {VIRTUAL_INSTRUMENT_REGISTRY.length} registered</p>
          <p>{t("researchCanvas.plans")}: {loadMeasurementPlans(idea.id).length} · {t("researchCanvas.passports")}: {loadMeasurementPassports(idea.id).length}</p>
        </section>
      ) : null}

      {feedback ? <p className="text-sm text-teal-400" role="status">{feedback}</p> : null}
    </div>
  );
}
