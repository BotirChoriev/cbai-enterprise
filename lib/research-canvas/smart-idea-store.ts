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
import {
  buildManualDescriptionItem,
  buildMappedFieldItem,
  buildMachineExtractedItem,
  evaluateIdeaModelGate,
  migrateExtractedItem,
  type IdeaModelGateResult,
} from "@/lib/research-canvas/interpretation-integrity";
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

function migrateIdea(idea: SmartIdea): SmartIdea {
  const stage = (idea.stage as string) === "PLAN" ? "EXECUTE" : idea.stage;
  return {
    ...idea,
    stage,
    extractedItems: idea.extractedItems.map(migrateExtractedItem),
  };
}

function withId(item: ExtractedItem): ExtractedItem {
  return { ...item, id: item.id || genesisId("extract") };
}

function updateIdea(ideaId: string, updater: (prev: SmartIdea) => SmartIdea): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const next = [...all];
  next[idx] = updater(all[idx]!);
  persist(next);
  return next[idx]!;
}

export function loadSmartIdeas(): SmartIdea[] {
  return readGenesisList(IDEAS_KEY, isSmartIdea, memoryIdeas).map(migrateIdea);
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
  return updateIdea(ideaId, (prev) => {
    let metadata: Record<string, string | number | boolean | null> = {};
    const extractedItems: ExtractedItem[] = [...prev.extractedItems];

    if (input.kind === "svg" && input.textContent) {
      const svg = analyzeSvgContent(input.textContent);
      metadata = { elementCount: svg.elementCount, viewBox: svg.viewBox ?? null, unsupportedPaths: svg.unsupportedPaths };
      for (const el of svg.elements.slice(0, 5)) {
        extractedItems.push(
          withId(
            buildMachineExtractedItem({
              field: `${el.tag} geometry`,
              value: JSON.stringify(el),
              sourceLocation: "svg-analyzer",
              method: "svg_geometry_parser",
            }),
          ),
        );
      }
      for (const label of svg.textLabels.slice(0, 5)) {
        extractedItems.push(
          withId(
            buildMachineExtractedItem({
              field: "text label",
              value: label,
              sourceLocation: "svg-text",
              method: "svg_geometry_parser",
            }),
          ),
        );
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
        withId(
          buildMachineExtractedItem({
            field: "image dimensions",
            value: `${img.pixelWidth ?? "?"}×${img.pixelHeight ?? "?"} px`,
            sourceLocation: "file-metadata",
            method: "file_metadata",
          }),
        ),
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

    audit("artifact_added", ideaId, prev.owner, artifact.fileName);
    return {
      ...prev,
      artifacts: [...prev.artifacts, artifact],
      extractedItems,
      stage: "INTERPRET",
      updatedAt: new Date().toISOString(),
    };
  });
}

export function confirmExtractedItem(
  ideaId: string,
  itemId: string,
  input: { correctedValue?: string; status?: InterpretationStatus; actor: string },
): SmartIdea | null {
  return updateIdea(ideaId, (prev) => {
    const items = prev.extractedItems.map((item) => {
      if (item.id !== itemId) return item;
      const migrated = migrateExtractedItem(item);
      const nextStatus = input.status ?? "Confirmed";
      if (nextStatus === "Confirmed" && migrated.confirmationStatus === "Insufficient Quality") {
        return migrated;
      }
      return {
        ...migrated,
        userCorrection: input.correctedValue ?? migrated.userCorrection,
        confirmationStatus: nextStatus,
        reviewedByHuman: nextStatus === "Confirmed",
        correctedAt: new Date().toISOString(),
        correctedBy: input.actor,
      };
    });
    audit("interpretation_confirmed", itemId, input.actor, input.status ?? "Confirmed");
    return {
      ...prev,
      extractedItems: items,
      stage: evaluateIdeaModelGate({ ...prev, extractedItems: items }).ok ? "INTERPRET" : "INTERPRET",
      updatedAt: new Date().toISOString(),
    };
  });
}

export function correctExtractedItem(
  ideaId: string,
  itemId: string,
  input: { correctedValue: string; actor: string },
): SmartIdea | null {
  const correctedValue = input.correctedValue.trim();
  if (!correctedValue) return null;

  return updateIdea(ideaId, (prev) => {
    const items = prev.extractedItems.map((item) => {
      if (item.id !== itemId) return item;
      const migrated = migrateExtractedItem(item);
      const history = [...(migrated.correctionHistory ?? [])];
      if (migrated.userCorrection?.trim()) {
        history.push({ value: migrated.userCorrection.trim(), at: migrated.correctedAt ?? new Date().toISOString(), by: migrated.correctedBy ?? input.actor });
      }
      return {
        ...migrated,
        originalText: migrated.originalText ?? migrated.extractedValue,
        userCorrection: correctedValue,
        confirmationStatus: "Human-Corrected" as InterpretationStatus,
        reviewedByHuman: false,
        correctedAt: new Date().toISOString(),
        correctedBy: input.actor,
        correctionHistory: history,
        limitationKey: "interpretHumanConfirmationRequired",
      };
    });
    audit("interpretation_corrected", itemId, input.actor, correctedValue.slice(0, 120));
    return { ...prev, extractedItems: items, updatedAt: new Date().toISOString() };
  });
}

export function rejectExtractedItem(
  ideaId: string,
  itemId: string,
  input: { reason?: string; actor: string },
): SmartIdea | null {
  return updateIdea(ideaId, (prev) => {
    const items = prev.extractedItems.map((item) => {
      if (item.id !== itemId) return item;
      const migrated = migrateExtractedItem(item);
      return {
        ...migrated,
        confirmationStatus: "Rejected" as InterpretationStatus,
        rejectionReason: input.reason?.trim() || null,
        reviewedByHuman: false,
        correctedAt: new Date().toISOString(),
        correctedBy: input.actor,
      };
    });
    audit("interpretation_rejected", itemId, input.actor, input.reason?.trim() || "rejected");
    return { ...prev, extractedItems: items, updatedAt: new Date().toISOString() };
  });
}

export function canBuildIdeaModel(idea: SmartIdea): IdeaModelGateResult {
  return evaluateIdeaModelGate(idea);
}

export function addManualInterpretationDraft(
  ideaId: string,
  detailedDescription: string,
  actor: string,
): SmartIdea | null {
  const trimmed = detailedDescription.trim();
  if (trimmed.length < 30) return null;

  return updateIdea(ideaId, (prev) => {
    const extractedItems: ExtractedItem[] = [withId(buildManualDescriptionItem(trimmed))];
    const mapped = [
      buildMappedFieldItem({ fieldKey: "problem_statement", fieldLabel: "problem statement", value: prev.problem }),
      buildMappedFieldItem({ fieldKey: "purpose", fieldLabel: "purpose", value: prev.purpose }),
      buildMappedFieldItem({ fieldKey: "original_description", fieldLabel: "original description", value: prev.originalDescription }),
    ].filter((item): item is ExtractedItem => item != null);

    for (const item of mapped) {
      extractedItems.push(withId(item));
    }

    audit("interpretation_draft_created", ideaId, actor, "manual_description");
    return {
      ...prev,
      extractedItems,
      stage: "INTERPRET",
      updatedAt: new Date().toISOString(),
    };
  });
}

export function buildIdeaModel(ideaId: string, input: Partial<IdeaModel>): SmartIdea | null {
  const all = loadSmartIdeas();
  const idx = all.findIndex((i) => i.id === ideaId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  const gate = evaluateIdeaModelGate(prev);
  if (!gate.ok) return null;

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
  return updateIdea(ideaId, (prev) => ({ ...prev, stage, updatedAt: new Date().toISOString() }));
}

export function confirmExternalSearch(
  ideaId: string,
  actor: string,
  input?: { queryOverride?: string },
): SmartIdea | null {
  return updateIdea(ideaId, (prev) => {
    const now = new Date().toISOString();
    audit("external_search_confirmed", ideaId, actor, "confirmed");
    return {
      ...prev,
      externalSearchConfirmed: true,
      externalSearchConsentAt: now,
      externalSearchRevoked: false,
      externalSearchRevokedAt: null,
      externalSearchQueryOverride: input?.queryOverride?.trim() || prev.externalSearchQueryOverride || null,
      updatedAt: now,
    };
  });
}

export function revokeExternalSearch(ideaId: string, actor: string): SmartIdea | null {
  return updateIdea(ideaId, (prev) => {
    const now = new Date().toISOString();
    audit("external_search_revoked", ideaId, actor, "revoked");
    return {
      ...prev,
      externalSearchConfirmed: false,
      externalSearchRevoked: true,
      externalSearchRevokedAt: now,
      updatedAt: now,
    };
  });
}

export function setExternalSearchQueryOverride(ideaId: string, query: string): SmartIdea | null {
  return updateIdea(ideaId, (prev) => ({
    ...prev,
    externalSearchQueryOverride: query.trim(),
    updatedAt: new Date().toISOString(),
  }));
}

export function linkSmartIdeaToMission(
  ideaId: string,
  links: { missionId?: string; projectId?: string; livingResearchObjectId?: string },
): SmartIdea | null {
  return updateIdea(ideaId, (prev) => ({ ...prev, ...links, stage: "MISSION", updatedAt: new Date().toISOString() }));
}

export function recordHumanDecision(
  ideaId: string,
  input: { selectedPath: string; reason: string; actor: string },
): SmartIdea | null {
  return updateIdea(ideaId, (prev) => {
    audit("human_decision_recorded", ideaId, input.actor, input.selectedPath);
    return {
      ...prev,
      humanDecision: `${input.selectedPath} — ${input.reason}`,
      stage: "DECIDE",
      updatedAt: new Date().toISOString(),
    };
  });
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

export { migrateExtractedItem };
