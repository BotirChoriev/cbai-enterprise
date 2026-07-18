/**
 * Per-Smart-Idea measurement workflow drafts — isolated in-session state.
 */

import type { MeasurementPlanDraft } from "@/lib/research-canvas/measurement-truth";
import { emptyMeasurementPlanDraft } from "@/lib/research-canvas/measurement-truth";

export type MeasurementWorkflowDraft = MeasurementPlanDraft & {
  readonly convValue: string;
  readonly convFrom: string;
  readonly convTo: string;
  readonly molecularFormula: string;
  readonly refPixels: string;
  readonly refReal: string;
  readonly pixelLength: string;
  readonly measureResult: string;
  readonly rawDataRef: string;
  readonly uncertainty: string;
  readonly calibration: string;
  readonly methodId: string;
};

export function emptyMeasurementWorkflowDraft(): MeasurementWorkflowDraft {
  return {
    ...emptyMeasurementPlanDraft(),
    convValue: "",
    convFrom: "cm",
    convTo: "m",
    molecularFormula: "",
    refPixels: "",
    refReal: "",
    pixelLength: "",
    measureResult: "",
    rawDataRef: "",
    uncertainty: "",
    calibration: "",
    methodId: "manual-entry",
  };
}

export type MeasurementDraftStore = {
  read(ideaId: string): MeasurementWorkflowDraft;
  write(ideaId: string, draft: MeasurementWorkflowDraft): void;
  clear(ideaId: string): void;
};

export function createMeasurementDraftStore(): MeasurementDraftStore {
  const drafts = new Map<string, MeasurementWorkflowDraft>();

  return {
    read(ideaId: string) {
      return drafts.get(ideaId) ?? emptyMeasurementWorkflowDraft();
    },
    write(ideaId: string, draft: MeasurementWorkflowDraft) {
      drafts.set(ideaId, draft);
    },
    clear(ideaId: string) {
      drafts.delete(ideaId);
    },
  };
}

export const measurementDraftStore = createMeasurementDraftStore();
