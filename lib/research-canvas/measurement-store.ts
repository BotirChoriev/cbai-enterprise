/**
 * Measurement plans and passports — Universal Measurement Protocol.
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type { MeasurementProvenanceKind } from "@/lib/research-canvas/measurement-provenance";
import {
  canCreateMeasurementPassport,
  isBlankOrDemo,
  passportValidationStatusForProvenance,
} from "@/lib/research-canvas/measurement-truth";
import type { MeasurementPassport, MeasurementPlan, MeasurementResultState } from "@/lib/research-canvas/research-canvas-types";

const PLANS_KEY = "cbai-research-canvas-measurement-plans";
const PASSPORTS_KEY = "cbai-research-canvas-measurement-passports";
const memoryPlans: MeasurementPlan[] = [];
const memoryPassports: MeasurementPassport[] = [];

function isPlan(v: unknown): v is MeasurementPlan {
  const p = v as MeasurementPlan;
  return typeof p?.id === "string" && typeof p?.measurand === "string";
}

function isPassport(v: unknown): v is MeasurementPassport {
  const p = v as MeasurementPassport;
  return typeof p?.id === "string" && typeof p?.measurand === "string";
}

function persistPlans(items: MeasurementPlan[]): void {
  writeGenesisList(PLANS_KEY, items, memoryPlans);
  notifyGenesisChanged();
}

function persistPassports(items: MeasurementPassport[]): void {
  writeGenesisList(PASSPORTS_KEY, items, memoryPassports);
  notifyGenesisChanged();
}

export function loadMeasurementPlans(smartIdeaId?: string): MeasurementPlan[] {
  const all = readGenesisList(PLANS_KEY, isPlan, memoryPlans);
  return smartIdeaId ? all.filter((p) => p.smartIdeaId === smartIdeaId) : all;
}

export function createMeasurementPlan(
  input: Omit<MeasurementPlan, "id" | "createdAt" | "updatedAt" | "state"> & { state?: MeasurementResultState },
): MeasurementPlan | null {
  if (isBlankOrDemo(input.measurand)) return null;
  const now = new Date().toISOString();
  const gaps: string[] = [];
  if (!input.measurand.trim()) gaps.push("Measurand required.");
  if (!input.unitId.trim()) gaps.push("Unit required.");
  if (!input.methodId.trim()) gaps.push("Method required.");
  const state =
    input.state ?? (gaps.length > 0 ? "Input Incomplete" : input.calibration.trim() ? "Ready to Measure" : "Calibration Missing");

  const plan: MeasurementPlan = {
    ...input,
    state,
    id: genesisId("mplan"),
    createdAt: now,
    updatedAt: now,
  };
  persistPlans([...loadMeasurementPlans(), plan]);
  recordGenesisAudit({
    domain: "research_canvas",
    action: "measurement_plan_created",
    recordType: "measurement_plan",
    recordId: plan.id,
    actorId: "operator",
    newState: state,
  });
  return plan;
}

export function loadMeasurementPassports(smartIdeaId?: string): MeasurementPassport[] {
  const all = readGenesisList(PASSPORTS_KEY, isPassport, memoryPassports);
  return smartIdeaId ? all.filter((p) => p.smartIdeaId === smartIdeaId) : all;
}

export function createMeasurementPassport(
  input: Omit<MeasurementPassport, "id" | "createdAt" | "updatedAt" | "validationStatus"> & {
    validationStatus?: MeasurementResultState;
    provenanceKind?: MeasurementProvenanceKind;
  },
): MeasurementPassport | null {
  const provenanceKind: MeasurementProvenanceKind = input.provenanceKind ?? "USER-PROVIDED";
  const gate = canCreateMeasurementPassport({
    planId: input.measurementPlanId ?? null,
    result: input.result,
    unit: input.unit,
    methodId: input.methodId,
    rawDataReference: input.rawDataReference,
    provenanceKind,
    limitations: input.limitations,
    reviewer: input.reviewer ?? undefined,
  });
  if (!gate.ok) return null;
  if (isBlankOrDemo(input.result) || isBlankOrDemo(input.rawDataReference)) return null;

  const now = new Date().toISOString();
  const passport: MeasurementPassport = {
    ...input,
    provenanceKind,
    validationStatus: input.validationStatus ?? passportValidationStatusForProvenance(provenanceKind),
    id: genesisId("mpass"),
    createdAt: now,
    updatedAt: now,
  };
  persistPassports([...loadMeasurementPassports(), passport]);
  recordGenesisAudit({
    domain: "research_canvas",
    action: "measurement_passport_created",
    recordType: "measurement_passport",
    recordId: passport.id,
    actorId: input.operator,
    newState: passport.validationStatus,
  });
  return passport;
}

export function validateMeasurementPassport(
  passportId: string,
  input: { reviewer: string; uncertainty: string; uncertaintyLimitation?: string },
): MeasurementPassport | null {
  const all = loadMeasurementPassports();
  const idx = all.findIndex((p) => p.id === passportId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  if (!prev.result.trim() || !prev.rawDataReference.trim()) return null;
  if (!input.reviewer.trim()) return null;
  if (!input.uncertainty.trim() && !input.uncertaintyLimitation?.trim()) return null;

  const updated: MeasurementPassport = {
    ...prev,
    reviewer: input.reviewer,
    uncertainty: input.uncertainty,
    uncertaintyLimitation: input.uncertaintyLimitation ?? prev.uncertaintyLimitation,
    validationStatus: "Validated",
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  persistPassports(next);
  return updated;
}

export function canValidatePassport(passport: MeasurementPassport): { ok: boolean; gaps: string[] } {
  const gaps: string[] = [];
  if (!passport.result.trim()) gaps.push("Result value required.");
  if (!passport.unit.trim()) gaps.push("Unit required.");
  if (!passport.methodId.trim()) gaps.push("Method required.");
  if (!passport.rawDataReference.trim()) gaps.push("Raw data reference required.");
  if (!passport.reviewer?.trim()) gaps.push("Human reviewer required for Validated status.");
  if (!passport.uncertainty.trim() && !passport.uncertaintyLimitation.trim()) {
    gaps.push("Uncertainty or explicit uncertainty limitation required.");
  }
  if (!passport.limitations.trim()) gaps.push("Limitations required.");
  if (!passport.provenanceKind?.trim()) gaps.push("Provenance required.");
  return { ok: gaps.length === 0, gaps };
}
