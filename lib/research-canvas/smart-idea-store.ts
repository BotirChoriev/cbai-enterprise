/**
 * Smart Idea store — device-local research canvas intake.
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import { analyzeSvgContent } from "@/lib/research-canvas/svg-geometry-analyzer";
import { analyzeImageMetadata } from "@/lib/research-canvas/image-metadata-analyzer";
import type {
  ExtractedItem,
  IdeaModel,
  InterpretationStatus,
  ResearchCanvasStage,
  SmartIdea,
  SmartIdeaArtifact,
  SmartIdeaVisibility,
} from "@/lib/research-canvas/research-canvas-types";

const IDEAS_KEY = "cbai-research-canvas-smart-ideas";
const memoryIdeas: SmartIdea[] = [];

function isSmartIdea(v: unknown): v is SmartIdea {
  const s = v as SmartIdea;
  return typeof s?.id === "string" && typeof s?.title === "string";
}

function persist(items: SmartIdea[]): void {
  writeGenesisList(IDEAS_KEY, items, memoryIdeas);
  notifyGenesisChanged();
}

function audit(action: string, recordId: string, actorId: string, next: string | null): void {
  recordGenesisAudit({
    domain: "research_canvas",
    action,
    recordType: "smart_idea",
    recordId,
    actorId,
    newState: next,
  });
}

function makeExtracted(field: string, value: string, source: string, confidence: number): ExtractedItem {
  return {
    id: genesisId("extract"),
    field,
    extractedValue: value,
    aiConfidence: confidence,
    sourceLocation: source,
    confirmationStatus: "Machine-Extracted",
    limitation: "Machine-extracted — requires human confirmation. AI confidence is not measurement uncertainty.",
  };
}

export function loadSmartIdeas(): SmartIdea[] {
  return readGenesisList(IDEAS_KEY, isSmartIdea, memoryIdeas).map((idea) =>
    (idea.stage as string) === "PLAN" ? { ...idea, stage: "EXECUTE" } : idea,
  );
}

export function loadSmartIdea(id: string): SmartIdea | null {
  return loadSmartIdeas().find((i) => i.id === id) ?? null;
}

export function createSmartIdea(input: {
  title: string;
  originalDescription: string;
  problem: string;
  purpose: string;
  intendedBeneficiary?: string;
  expectedResult?: string;
  domain?: string;
  owner: string;
  visibility?: SmartIdeaVisibility;
  ipBoundary?: string;
}): SmartIdea {
  const now = new Date().toISOString();
  const idea: SmartIdea = {
    id: genesisId("sidea"),
    title: input.title.trim(),
    originalDescription: input.originalDescription.trim(),
    problem: input.problem.trim(),
    purpose: input.purpose.trim(),
    intendedBeneficiary: input.intendedBeneficiary?.trim() ?? "",
    expectedResult: input.expectedResult?.trim() ?? "",
    domain: input.domain?.trim() ?? "general",
    visibility: input.visibility ?? "Private",
    ipBoundary: input.ipBoundary?.trim() ?? "User retains responsibility for IP boundaries.",
    owner: input.owner,
    stage: "IDEA",
    artifacts: [],
    extractedItems: [],
    ideaModel: null,
    externalSearchConfirmed: false,
    externalSearchRevoked: false,
    createdAt: now,
    updatedAt: now,
  };
  persist([...loadSmartIdeas(), idea]);
  audit("smart_idea_created", idea.id, input.owner, idea.title);
  return idea;
}

export function addSmartIdeaArtifact(
  ideaId: string,
  input: {
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    kind: SmartIdeaArtifact["kind"];
    dataUrl?: string | null;
    textContent?: string | null;
    pixelWidth?: number | null;
    pixelHeight?: number | null;
  },
): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const prev = all[idx]!;

  let metadata: Record<string, string | number | boolean | null> = {};
  const extractedItems: ExtractedItem[] = [...prev.extractedItems];

  if (input.kind === "svg" && input.textContent) {
    const svg = analyzeSvgContent(input.textContent);
    metadata = { elementCount: svg.elementCount, viewBox: svg.viewBox ?? null, unsupportedPaths: svg.unsupportedPaths };
    for (const el of svg.elements.slice(0, 5)) {
      extractedItems.push(makeExtracted(`${el.tag} geometry`, JSON.stringify(el), "svg-analyzer", 0.6));
    }
    for (const label of svg.textLabels.slice(0, 5)) {
      extractedItems.push(makeExtracted("text label", label, "svg-text", 0.7));
    }
  } else if (input.kind === "image") {
    const img = analyzeImageMetadata({
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      pixelWidth: input.pixelWidth,
      pixelHeight: input.pixelHeight,
    });
    metadata = {
      pixelWidth: img.pixelWidth ?? null,
      pixelHeight: img.pixelHeight ?? null,
      aspectRatio: img.aspectRatio ?? null,
      hasScale: img.hasScaleInformation,
    };
    extractedItems.push(
      makeExtracted("image dimensions", `${img.pixelWidth ?? "?"}×${img.pixelHeight ?? "?"} px`, "file-metadata", 0.95),
    );
  }

  const artifact: SmartIdeaArtifact = {
    id: genesisId("artifact"),
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSizeBytes: input.fileSizeBytes,
    kind: input.kind,
    dataUrl: input.dataUrl ?? null,
    metadata,
  };

  const updated: SmartIdea = {
    ...prev,
    artifacts: [...prev.artifacts, artifact],
    extractedItems: extractedItems.map((e) => ({ ...e, confirmationStatus: "Awaiting Human Confirmation" as InterpretationStatus })),
    stage: "INTERPRET",
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  persist(next);
  audit("artifact_added", ideaId, prev.owner, artifact.fileName);
  return updated;
}

export function confirmExtractedItem(
  ideaId: string,
  itemId: string,
  input: { correctedValue?: string; status: InterpretationStatus; actor: string },
): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  const items = prev.extractedItems.map((item) =>
    item.id !== itemId
      ? item
      : {
          ...item,
          userCorrection: input.correctedValue ?? item.userCorrection,
          confirmationStatus: input.status,
          correctedAt: new Date().toISOString(),
          correctedBy: input.actor,
        },
  );
  const updated: SmartIdea = {
    ...prev,
    extractedItems: items,
    stage: items.every((i) => i.confirmationStatus === "Confirmed" || i.confirmationStatus === "Rejected") ? "MEASURE" : "INTERPRET",
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  persist(next);
  audit("interpretation_confirmed", itemId, input.actor, input.status);
  return updated;
}

export function buildIdeaModel(ideaId: string, input: Partial<IdeaModel>): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const prev = all[idx]!;

  const model: IdeaModel = {
    workingPrinciple: input.workingPrinciple ?? prev.purpose,
    components: input.components ?? [],
    materials: input.materials ?? [],
    variables: input.variables ?? [],
    dimensions: input.dimensions ?? [],
    formulas: input.formulas ?? [],
    processFlow: input.processFlow ?? "",
    expectedOutput: input.expectedOutput ?? prev.expectedResult,
    expectedOutcome: input.expectedOutcome ?? "",
    assumptions: input.assumptions ?? [],
    unknowns: input.unknowns ?? [],
    risks: input.risks ?? [],
    safetyConsiderations: input.safetyConsiderations ?? "",
    humanityBenefit: input.humanityBenefit ?? "",
    natureImpact: input.natureImpact ?? "",
    researchQuestions: input.researchQuestions ?? [prev.problem],
    requiredValidation: input.requiredValidation ?? ["Measurement plan required."],
    completeness: input.completeness ?? {
      problem: prev.problem ? "Defined" : "Missing",
      purpose: prev.purpose ? "Defined" : "Missing",
      method: "Missing",
      calibration: "Missing",
    },
  };

  const updated: SmartIdea = { ...prev, ideaModel: model, stage: "MEASURE", updatedAt: new Date().toISOString() };
  const next = [...all];
  next[idx] = updated;
  persist(next);
  audit("idea_model_created", ideaId, prev.owner, "IdeaModel");
  return updated;
}

export function updateSmartIdeaStage(ideaId: string, stage: ResearchCanvasStage): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const next = [...all];
  next[idx] = { ...all[idx]!, stage, updatedAt: new Date().toISOString() };
  persist(next);
  return next[idx]!;
}

export function confirmExternalSearch(
  ideaId: string,
  actor: string,
  input?: { queryOverride?: string },
): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  const next = [...all];
  next[idx] = {
    ...all[idx]!,
    externalSearchConfirmed: true,
    externalSearchConsentAt: now,
    externalSearchRevoked: false,
    externalSearchRevokedAt: null,
    externalSearchQueryOverride: input?.queryOverride?.trim() || all[idx]!.externalSearchQueryOverride || null,
    updatedAt: now,
  };
  persist(next);
  audit("external_search_confirmed", ideaId, actor, "confirmed");
  return next[idx]!;
}

export function revokeExternalSearch(ideaId: string, actor: string): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  const next = [...all];
  next[idx] = {
    ...all[idx]!,
    externalSearchConfirmed: false,
    externalSearchRevoked: true,
    externalSearchRevokedAt: now,
    updatedAt: now,
  };
  persist(next);
  audit("external_search_revoked", ideaId, actor, "revoked");
  return next[idx]!;
}

export function setExternalSearchQueryOverride(ideaId: string, query: string): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const next = [...all];
  next[idx] = { ...all[idx]!, externalSearchQueryOverride: query.trim(), updatedAt: new Date().toISOString() };
  persist(next);
  return next[idx]!;
}

export function linkSmartIdeaToMission(
  ideaId: string,
  links: { missionId?: string; projectId?: string; livingResearchObjectId?: string },
): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const next = [...all];
  next[idx] = { ...all[idx]!, ...links, stage: "MISSION", updatedAt: new Date().toISOString() };
  persist(next);
  return next[idx]!;
}

export function recordHumanDecision(
  ideaId: string,
  input: { selectedPath: string; reason: string; actor: string },
): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const next = [...all];
  next[idx] = {
    ...all[idx]!,
    humanDecision: `${input.selectedPath} — ${input.reason}`,
    stage: "DECIDE",
    updatedAt: new Date().toISOString(),
  };
  persist(next);
  audit("human_decision_recorded", ideaId, input.actor, input.selectedPath);
  return next[idx]!;
}

export function getSanitizedSearchConcepts(idea: SmartIdea): string[] {
  return [
    ...new Set(
      [idea.problem, idea.purpose, idea.domain, ...(idea.ideaModel?.researchQuestions ?? [])]
        .map((s) => s.trim())
        .filter((s) => s.length > 3),
    ),
  ].slice(0, 5);
}

export function buildExternalSearchQuery(idea: SmartIdea, keyword?: string): string {
  if (keyword?.trim()) return keyword.trim();
  if (idea.externalSearchQueryOverride?.trim()) return idea.externalSearchQueryOverride.trim();
  return getSanitizedSearchConcepts(idea).slice(0, 3).join(" ");
}
