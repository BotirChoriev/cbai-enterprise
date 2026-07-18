/**
 * Interpretation truth integrity — provenance, quality gates, and Idea Model readiness.
 */

import type { ExtractedItem, InterpretationStatus, SmartIdea } from "@/lib/research-canvas/research-canvas-types";

export const INTERPRETATION_FIELD_KEYS = [
  "manual_description",
  "problem_statement",
  "purpose",
  "original_description",
  "artifact_extraction",
] as const;

export type InterpretationFieldKey = (typeof INTERPRETATION_FIELD_KEYS)[number];

export const INTERPRETATION_PROVENANCES = [
  "USER-PROVIDED",
  "EXTRACTED_FROM_USER_INPUT",
  "MACHINE-EXTRACTED",
  "UNKNOWN",
] as const;

export type InterpretationProvenance = (typeof INTERPRETATION_PROVENANCES)[number];

export const INTERPRETATION_METHODS = [
  "manual_description",
  "deterministic_field_mapping",
  "svg_geometry_parser",
  "file_metadata",
  "unknown",
] as const;

export type InterpretationMethod = (typeof INTERPRETATION_METHODS)[number];

export type InterpretationQuality = "meaningful" | "insufficient" | "uncertain";

export type IdeaModelGateReasonKey =
  | "no_extractions"
  | "required_missing"
  | "required_rejected"
  | "required_insufficient"
  | "required_pending"
  | "required_not_confirmed"
  | "none_confirmed";

export type IdeaModelGateResult = {
  readonly ok: boolean;
  readonly reasonKeys: readonly IdeaModelGateReasonKey[];
  readonly fieldKeys: readonly InterpretationFieldKey[];
};

const PLACEHOLDER_VALUES = new Set([
  "x",
  "y",
  "z",
  "test",
  "todo",
  "tbd",
  "n/a",
  "na",
  "none",
  "...",
  "—",
  "-",
]);

const REQUIRED_FIELD_KEYS: readonly InterpretationFieldKey[] = ["manual_description"];

export function isRequiredInterpretationField(fieldKey: InterpretationFieldKey | string | undefined): boolean {
  return fieldKey === "manual_description";
}

export function assessInputQuality(value: string): InterpretationQuality {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return "insufficient";
  if (normalized.length < 2) return "insufficient";
  if (PLACEHOLDER_VALUES.has(normalized.toLowerCase())) return "insufficient";
  if (normalized.length < 12 && !normalized.includes(" ")) return "uncertain";
  return "meaningful";
}

export function statusForQuality(quality: InterpretationQuality): InterpretationStatus {
  if (quality === "insufficient") return "Insufficient Quality";
  if (quality === "uncertain") return "Awaiting Human Confirmation";
  return "Awaiting Human Confirmation";
}

export function displayInterpretationValue(item: ExtractedItem): string {
  return item.userCorrection?.trim() || item.extractedValue;
}

export function hasDocumentedModelConfidence(item: ExtractedItem): boolean {
  return item.aiConfidence != null && item.method !== "manual_description" && item.method !== "deterministic_field_mapping";
}

function asInterpretationMethod(value: string | null | undefined, sourceLocation?: string | null): InterpretationMethod {
  if (
    value === "manual_description" ||
    value === "deterministic_field_mapping" ||
    value === "svg_geometry_parser" ||
    value === "file_metadata" ||
    value === "unknown"
  ) {
    return value;
  }
  return inferMethod(sourceLocation);
}

export function migrateExtractedItem(raw: ExtractedItem): ExtractedItem {
  const fieldKey = raw.fieldKey ?? inferFieldKey(raw.field, raw.sourceLocation);
  const method = asInterpretationMethod(raw.method, raw.sourceLocation);
  const provenance = raw.provenance ?? inferProvenance(method, raw.sourceLocation);
  const originalText = raw.originalText ?? raw.extractedValue;
  const required = raw.required ?? isRequiredInterpretationField(fieldKey);

  let aiConfidence = raw.aiConfidence;
  if (method === "manual_description" || method === "deterministic_field_mapping") {
    aiConfidence = null;
  } else if (aiConfidence === 1 && (method === "file_metadata" || method === "svg_geometry_parser")) {
    aiConfidence = null;
  }

  return {
    ...raw,
    fieldKey,
    method,
    provenance,
    originalText,
    required,
    aiConfidence,
    reviewedByHuman: raw.reviewedByHuman ?? raw.confirmationStatus === "Confirmed",
    limitationKey: raw.limitationKey ?? inferLimitationKey(method, raw.limitation),
    correctionHistory: raw.correctionHistory ?? [],
    rejectionReason: raw.rejectionReason ?? null,
  };
}

function inferFieldKey(field: string, sourceLocation?: string | null): InterpretationFieldKey {
  const f = field.toLowerCase();
  if (f.includes("manual description")) return "manual_description";
  if (f.includes("problem")) return "problem_statement";
  if (f.includes("purpose")) return "purpose";
  if (f.includes("original description")) return "original_description";
  if (sourceLocation?.includes("svg") || sourceLocation?.includes("metadata")) return "artifact_extraction";
  return "artifact_extraction";
}

function inferMethod(sourceLocation?: string | null): InterpretationMethod {
  if (sourceLocation === "user-manual") return "manual_description";
  if (sourceLocation === "intake") return "deterministic_field_mapping";
  if (sourceLocation?.includes("svg")) return "svg_geometry_parser";
  if (sourceLocation?.includes("metadata")) return "file_metadata";
  return "unknown";
}

function inferProvenance(method: InterpretationMethod, sourceLocation?: string | null): InterpretationProvenance {
  if (method === "manual_description") return "USER-PROVIDED";
  if (method === "deterministic_field_mapping" || sourceLocation === "intake") return "EXTRACTED_FROM_USER_INPUT";
  if (method === "svg_geometry_parser" || method === "file_metadata") return "MACHINE-EXTRACTED";
  return "UNKNOWN";
}

function inferLimitationKey(method: InterpretationMethod, legacy?: string | null): string {
  if (method === "manual_description") return "interpretManualDraftNotice";
  if (method === "deterministic_field_mapping") return "interpretDeterministicMappingNotice";
  if (legacy?.includes("Machine-extracted")) return "interpretMachineExtractedNotice";
  return "interpretHumanConfirmationRequired";
}

export function buildManualDescriptionItem(text: string): ExtractedItem {
  const trimmed = text.trim();
  return {
    id: "",
    field: "manual description",
    fieldKey: "manual_description",
    extractedValue: trimmed,
    originalText: trimmed,
    aiConfidence: null,
    provenance: "USER-PROVIDED",
    method: "manual_description",
    required: true,
    sourceLocation: "user-manual",
    confirmationStatus: "Awaiting Human Confirmation",
    limitationKey: "interpretManualDraftNotice",
    limitation: null,
    reviewedByHuman: false,
    correctionHistory: [],
    rejectionReason: null,
  };
}

export function buildMappedFieldItem(input: {
  fieldKey: Exclude<InterpretationFieldKey, "manual_description" | "artifact_extraction">;
  fieldLabel: string;
  value: string;
}): ExtractedItem | null {
  const trimmed = input.value.trim();
  if (!trimmed) return null;
  const quality = assessInputQuality(trimmed);
  if (quality === "insufficient") {
    return {
      id: "",
      field: input.fieldLabel,
      fieldKey: input.fieldKey,
      extractedValue: trimmed,
      originalText: trimmed,
      aiConfidence: null,
      provenance: "EXTRACTED_FROM_USER_INPUT",
      method: "deterministic_field_mapping",
      required: false,
      sourceLocation: "intake",
      confirmationStatus: "Insufficient Quality",
      limitationKey: "interpretInsufficientInformation",
      limitation: null,
      reviewedByHuman: false,
      correctionHistory: [],
      rejectionReason: null,
    };
  }
  return {
    id: "",
    field: input.fieldLabel,
    fieldKey: input.fieldKey,
    extractedValue: trimmed,
    originalText: trimmed,
    aiConfidence: null,
    provenance: "EXTRACTED_FROM_USER_INPUT",
    method: "deterministic_field_mapping",
    required: false,
    sourceLocation: "intake",
    confirmationStatus: statusForQuality(quality),
    limitationKey: quality === "uncertain" ? "interpretUncertainHumanReview" : "interpretDeterministicMappingNotice",
    limitation: null,
    reviewedByHuman: false,
    correctionHistory: [],
    rejectionReason: null,
  };
}

export function buildMachineExtractedItem(input: {
  field: string;
  value: string;
  sourceLocation: string;
  method: "svg_geometry_parser" | "file_metadata";
}): ExtractedItem {
  return {
    id: "",
    field: input.field,
    fieldKey: "artifact_extraction",
    extractedValue: input.value,
    originalText: input.value,
    aiConfidence: null,
    provenance: "MACHINE-EXTRACTED",
    method: input.method,
    required: false,
    sourceLocation: input.sourceLocation,
    confirmationStatus: "Awaiting Human Confirmation",
    limitationKey: "interpretMachineExtractedNotice",
    limitation: null,
    reviewedByHuman: false,
    correctionHistory: [],
    rejectionReason: null,
  };
}

export function evaluateIdeaModelGate(idea: SmartIdea): IdeaModelGateResult {
  const items = idea.extractedItems.map(migrateExtractedItem);
  const reasonKeys: IdeaModelGateReasonKey[] = [];
  const fieldKeys: InterpretationFieldKey[] = [];

  if (items.length === 0) {
    return { ok: false, reasonKeys: ["no_extractions"], fieldKeys: [] };
  }

  const hasManualDraft = items.some((i) => i.fieldKey === "manual_description");

  if (hasManualDraft) {
    for (const requiredKey of REQUIRED_FIELD_KEYS) {
      const item = items.find((i) => i.fieldKey === requiredKey);
      if (!item) {
        reasonKeys.push("required_missing");
        fieldKeys.push(requiredKey);
      }
    }

    for (const item of items.filter((i) => i.required)) {
      if (item.confirmationStatus === "Rejected") {
        reasonKeys.push("required_rejected");
        if (item.fieldKey) fieldKeys.push(item.fieldKey as InterpretationFieldKey);
        continue;
      }
      if (item.confirmationStatus === "Insufficient Quality") {
        reasonKeys.push("required_insufficient");
        if (item.fieldKey) fieldKeys.push(item.fieldKey as InterpretationFieldKey);
        continue;
      }
      if (item.confirmationStatus !== "Confirmed") {
        reasonKeys.push("required_not_confirmed");
        if (item.fieldKey) fieldKeys.push(item.fieldKey as InterpretationFieldKey);
      }
    }

    const confirmedRequired = items.filter(
      (i) =>
        i.required &&
        i.confirmationStatus === "Confirmed" &&
        assessInputQuality(displayInterpretationValue(i)) !== "insufficient",
    );
    if (confirmedRequired.length === 0) {
      reasonKeys.push("none_confirmed");
    }
  } else {
    const blocking = items.filter(
      (i) =>
        i.confirmationStatus !== "Confirmed" &&
        i.confirmationStatus !== "Rejected" &&
        (i.required || !i.fieldKey || i.fieldKey === "artifact_extraction"),
    );
    if (blocking.length > 0) {
      reasonKeys.push("required_pending");
    }
    if (items.every((i) => i.confirmationStatus !== "Confirmed")) {
      reasonKeys.push("none_confirmed");
    }
  }

  const uniqueReasons = [...new Set(reasonKeys)] as IdeaModelGateReasonKey[];
  const uniqueFields = [...new Set(fieldKeys)] as InterpretationFieldKey[];
  const blocking = uniqueReasons.some((k) =>
    [
      "no_extractions",
      "required_missing",
      "required_rejected",
      "required_insufficient",
      "required_not_confirmed",
      "required_pending",
      "none_confirmed",
    ].includes(k),
  );

  return { ok: !blocking, reasonKeys: uniqueReasons, fieldKeys: uniqueFields };
}

export function canConfirmInterpretationItem(item: ExtractedItem): boolean {
  const migrated = migrateExtractedItem(item);
  if (migrated.confirmationStatus === "Confirmed" || migrated.confirmationStatus === "Rejected") return false;
  if (migrated.confirmationStatus === "Insufficient Quality") return false;
  return assessInputQuality(displayInterpretationValue(migrated)) !== "insufficient";
}

export function canCorrectInterpretationItem(item: ExtractedItem): boolean {
  const migrated = migrateExtractedItem(item);
  return migrated.confirmationStatus !== "Confirmed" && migrated.confirmationStatus !== "Rejected";
}
