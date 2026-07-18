"use client";

import { useCallback, useMemo, useState } from "react";
import { convertUnits, buildConversionRecord } from "@/lib/research-canvas/unit-converter";
import { getUnit, UNIT_REGISTRY } from "@/lib/research-canvas/unit-registry";
import { runCalculation } from "@/lib/research-canvas/scientific-calculator";
import { METHOD_REGISTRY } from "@/lib/research-canvas/instrument-registry";
import {
  createMeasurementPlan,
  createMeasurementPassport,
  loadMeasurementPassports,
  loadMeasurementPlans,
} from "@/lib/research-canvas/measurement-store";
import { parseMolecularFormula } from "@/lib/research-canvas/molecular-formula-analyzer";
import {
  canRunCalculation,
  evaluateMeasurementPlanReadiness,
  imageScaleProvided,
  inferSuggestedMeasurementTypes,
  operationalMetricOptions,
  type MeasurementType,
} from "@/lib/research-canvas/measurement-truth";
import {
  emptyMeasurementWorkflowDraft,
  measurementDraftStore,
  type MeasurementWorkflowDraft,
} from "@/lib/research-canvas/measurement-draft-store";
import type { SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import type { MolecularAnalysisResult } from "@/lib/research-canvas/molecular-formula-analyzer";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiMineralSurface } from "@/components/brand/brand-classes";

type Props = {
  readonly idea: SmartIdea;
  readonly operator: string;
  readonly rc: (key: string) => string;
  readonly onFeedback: (message: string) => void;
  readonly onBump: () => void;
};

type CalculationSnapshot = {
  readonly labelKey: string;
  readonly value: string;
  readonly provenanceKey: string;
  readonly formula: string;
  readonly limitations: readonly string[];
  readonly at: string;
};

export default function MeasurementWorkflowPanel({ idea, operator, rc, onFeedback, onBump }: Props) {
  const [draft, setDraft] = useState<MeasurementWorkflowDraft>(() => measurementDraftStore.read(idea.id));
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<CalculationSnapshot | null>(null);
  const [geometryResult, setGeometryResult] = useState<CalculationSnapshot | null>(null);
  const [molecularResult, setMolecularResult] = useState<MolecularAnalysisResult | null>(null);
  const [showMolecularTechnical, setShowMolecularTechnical] = useState(false);

  const suggestedTypes = useMemo(() => inferSuggestedMeasurementTypes(idea), [idea]);
  const readiness = useMemo(() => evaluateMeasurementPlanReadiness(draft), [draft]);
  const passports = useMemo(() => loadMeasurementPassports(idea.id), [idea.id, onBump]);
  const plans = useMemo(() => loadMeasurementPlans(idea.id), [idea.id, onBump]);

  const patchDraft = useCallback(
    (partial: Partial<MeasurementWorkflowDraft>) => {
      setDraft((prev) => {
        const next = { ...prev, ...partial };
        measurementDraftStore.write(idea.id, next);
        return next;
      });
    },
    [idea.id],
  );

  const resetDraft = useCallback(() => {
    const empty = emptyMeasurementWorkflowDraft();
    measurementDraftStore.write(idea.id, empty);
    setDraft(empty);
    setConversionResult(null);
    setGeometryResult(null);
    setMolecularResult(null);
  }, [idea.id]);

  const savePlan = () => {
    if (!draft.measurand.trim()) {
      onFeedback(rc("measurementNeedsDefinition"));
      return;
    }
    const plan = createMeasurementPlan({
      smartIdeaId: idea.id,
      measurand: draft.measurand,
      purpose: draft.purpose || idea.purpose,
      domain: idea.domain,
      sampleOrObject: idea.title,
      methodId: draft.methodId,
      instrumentId: METHOD_REGISTRY.find((m) => m.id === draft.methodId)?.instrumentId ?? "manual-entry",
      unitId: draft.unitId || "dimensionless",
      calibration: draft.referenceCalibration || draft.calibration,
      referenceStandard: draft.referenceCalibration,
      conditions: draft.scope,
      rawDataReference: draft.rawDataSource,
      processingModel: draft.methodOrFormula,
      uncertaintyNote: draft.uncertaintyLimitations,
      validationNote: draft.acceptanceCriterion,
      humanReviewRequired: Boolean(draft.humanReviewer.trim()),
      state: readiness.readiness === "ready_to_collect" ? "Ready to Measure" : "Input Incomplete",
    });
    if (!plan) {
      onFeedback(rc("measurementNeedsDefinition"));
      return;
    }
    setActivePlanId(plan.id);
    onFeedback(rc("planCreated"));
    onBump();
  };

  const runConvert = () => {
    const gate = canRunCalculation({
      values: { convValue: draft.convValue },
      explicitAction: true,
    });
    if (!gate.ok) {
      onFeedback(rc(gate.reasonKey ?? "calculationRequiresUserInput"));
      return;
    }
    const result = convertUnits({
      value: Number(draft.convValue),
      fromUnitId: draft.convFrom,
      toUnitId: draft.convTo,
      smartIdeaId: idea.id,
    });
    if (!result.ok) {
      onFeedback(result.reason);
      return;
    }
    buildConversionRecord(result.record);
    setConversionResult({
      labelKey: "resultCalculated",
      value: `${result.convertedValue} ${draft.convTo}`,
      provenanceKey: "provenanceCalculated",
      formula: result.formula,
      limitations: [rc("calculatedNotMeasuredNotice")],
      at: new Date().toISOString(),
    });
    onBump();
  };

  const runGeometryCalc = () => {
    const gate = canRunCalculation({
      values: {
        pixelLength: draft.pixelLength,
        referenceReal: draft.refReal,
        referencePixels: draft.refPixels,
      },
      explicitAction: true,
    });
    if (!gate.ok) {
      onFeedback(rc(gate.reasonKey ?? "calculationRequiresUserInput"));
      return;
    }
    if (!imageScaleProvided(draft.refPixels, draft.refReal)) {
      onFeedback(rc("imageScaleRequired"));
      return;
    }
    const calc = runCalculation({
      smartIdeaId: idea.id,
      formulaId: "pixel-distance",
      variables: {
        pixelLength: Number(draft.pixelLength),
        referenceReal: Number(draft.refReal),
        referencePixels: Number(draft.refPixels),
      },
      variableUnits: { pixelLength: "px", referenceReal: "cm", referencePixels: "px" },
    });
    if (!calc.ok) {
      onFeedback(calc.reason);
      return;
    }
    setGeometryResult({
      labelKey: "resultCalculatedFromUserInput",
      value: String(calc.record.result),
      provenanceKey: "provenanceCalculated",
      formula: calc.record.formulaName,
      limitations: [rc("calculatedNotMeasuredNotice"), rc("imageMeasurementPreviewNotice")],
      at: new Date().toISOString(),
    });
    onBump();
  };

  const runMolecularCalc = () => {
    const formula = draft.molecularFormula.trim();
    if (!formula) {
      onFeedback(rc("molecularFormulaRequired"));
      return;
    }
    const parsed = parseMolecularFormula(formula);
    if (parsed.parseError) {
      onFeedback(parsed.parseError);
      return;
    }
    setMolecularResult(parsed);
    onBump();
  };

  const addPassport = () => {
    const planId = activePlanId ?? plans[plans.length - 1]?.id ?? null;
    const provenanceKind = conversionResult || geometryResult || molecularResult ? "CALCULATED" : "USER-PROVIDED";
    const resultValue =
      draft.measureResult.trim() ||
      conversionResult?.value ||
      geometryResult?.value ||
      (molecularResult?.molecularMass != null ? String(molecularResult.molecularMass) : "");
    const p = createMeasurementPassport({
      smartIdeaId: idea.id,
      measurementPlanId: planId,
      measuredObject: idea.title,
      measurand: draft.measurand,
      result: resultValue,
      unit: draft.unitId ? (getUnit(draft.unitId)?.symbol ?? draft.unitId) : molecularResult ? "g/mol" : "",
      uncertainty: draft.uncertainty,
      uncertaintyType: "manual",
      uncertaintyLimitation: draft.uncertainty.trim() ? "" : draft.uncertaintyLimitations,
      methodId: draft.methodId,
      instrumentId: "manual-entry",
      instrumentModel: "manual",
      calibrationStatus: draft.referenceCalibration ? "user-defined" : "missing",
      referenceStandard: draft.referenceCalibration || draft.calibration,
      rawDataReference: draft.rawDataRef || draft.rawDataSource,
      processingSoftware: "cbai-research-canvas",
      algorithmVersion: "1.0",
      environmentalConditions: "",
      operator,
      laboratory: "device-local",
      limitations: draft.uncertaintyLimitations || rc("passportDefaultLimitations"),
      reproducibilityStatus: "not replicated",
      provenanceKind,
      reviewer: draft.humanReviewer || null,
    });
    onFeedback(p ? rc("passportCreated") : rc("passportGateFailed"));
    onBump();
  };

  const renderCalculationCard = (snapshot: CalculationSnapshot) => (
    <div className="rounded border border-zinc-800 bg-zinc-950/40 p-3 text-sm">
      <p className="text-xs uppercase tracking-wide text-teal-400/90">{rc(snapshot.provenanceKey)}</p>
      <p className="font-medium text-zinc-200">{rc(snapshot.labelKey)}: {snapshot.value}</p>
      <p className="text-xs text-zinc-500">{rc("calculationFormula")}: {snapshot.formula}</p>
      <p className="text-xs text-zinc-500">{rc("calculationTimestamp")}: {snapshot.at}</p>
      <ul className="mt-1 list-disc pl-4 text-xs text-zinc-500">
        {snapshot.limitations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );

  const renderTypeSelector = () => (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-200">{rc("measurementTypeLabel")}</h3>
      <p className="text-xs text-zinc-500">{rc("measurementTypeHint")}</p>
      <div className="flex flex-wrap gap-2">
        {(["physical", "chemical", "digital", "statistical", "operational", "qualitative"] as MeasurementType[]).map(
          (type) => {
            const suggested = suggestedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => patchDraft({ measurementType: type })}
                className={`${cbaiFocusRing} rounded-md border px-3 py-2 text-xs ${
                  draft.measurementType === type
                    ? "border-teal-600 bg-teal-950/30 text-teal-200"
                    : suggested
                      ? "border-zinc-700 text-zinc-300"
                      : "border-zinc-800 text-zinc-500"
                }`}
              >
                {rc(`measurementType_${type}`)}
                {suggested ? ` · ${rc("measurementTypeSuggested")}` : ""}
              </button>
            );
          },
        )}
      </div>
      {!draft.measurementType ? (
        <p className="text-xs text-amber-400/90">{rc("measurementMethodNotDefined")}</p>
      ) : null}
    </section>
  );

  return (
    <div className={`${cbaiMineralSurface} grid gap-4 lg:grid-cols-2`}>
      {renderTypeSelector()}

      <section className="space-y-3 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-200">{rc("measurementPlan")}</h3>
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
            {rc(`planReadiness_${readiness.readiness}`)}
          </span>
        </div>
        <input
          value={draft.measurand}
          onChange={(e) => patchDraft({ measurand: e.target.value })}
          placeholder={rc("measurandPlaceholderExample")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <input
          value={draft.purpose}
          onChange={(e) => patchDraft({ purpose: e.target.value })}
          placeholder={rc("measurementPurposePlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <input
          value={draft.operationalDefinition}
          onChange={(e) => patchDraft({ operationalDefinition: e.target.value })}
          placeholder={rc("operationalDefinitionPlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <input
          value={draft.methodOrFormula}
          onChange={(e) => patchDraft({ methodOrFormula: e.target.value })}
          placeholder={rc("methodOrFormulaPlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <input
          value={draft.rawDataSource}
          onChange={(e) => patchDraft({ rawDataSource: e.target.value })}
          placeholder={rc("rawDataPlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={draft.scope}
            onChange={(e) => patchDraft({ scope: e.target.value })}
            placeholder={rc("measurementScopePlaceholder")}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          />
          <input
            value={draft.period}
            onChange={(e) => patchDraft({ period: e.target.value })}
            placeholder={rc("measurementPeriodPlaceholder")}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          />
        </div>
        <input
          value={draft.uncertaintyLimitations}
          onChange={(e) => patchDraft({ uncertaintyLimitations: e.target.value })}
          placeholder={rc("uncertaintyPlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <input
          value={draft.acceptanceCriterion}
          onChange={(e) => patchDraft({ acceptanceCriterion: e.target.value })}
          placeholder={rc("acceptanceCriterionPlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <input
          value={draft.humanReviewer}
          onChange={(e) => patchDraft({ humanReviewer: e.target.value })}
          placeholder={rc("humanReviewerPlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <button type="button" onClick={savePlan} className={cbaiBtnPrimary}>
          {rc("createPlan")}
        </button>
      </section>

      {draft.measurementType === "operational" ? (
        <section className="space-y-3 lg:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-200">{rc("operationalMeasurementTitle")}</h3>
          <p className="text-xs text-zinc-500">{rc("operationalMeasurementHint")}</p>
          <select
            value={draft.measurand}
            onChange={(e) => patchDraft({ measurand: e.target.value })}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          >
            <option value="">{rc("operationalMetricSelect")}</option>
            {operationalMetricOptions().map((metric) => (
              <option key={metric} value={metric}>
                {rc(`operationalMetric_${metric}`)}
              </option>
            ))}
          </select>
          <input
            value={draft.operationalEvent}
            onChange={(e) => patchDraft({ operationalEvent: e.target.value })}
            placeholder={rc("operationalEventPlaceholder")}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={draft.operationalNumerator}
              onChange={(e) => patchDraft({ operationalNumerator: e.target.value })}
              placeholder={rc("operationalNumeratorPlaceholder")}
              className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
            />
            <input
              value={draft.operationalDenominator}
              onChange={(e) => patchDraft({ operationalDenominator: e.target.value })}
              placeholder={rc("operationalDenominatorPlaceholder")}
              className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
            />
          </div>
        </section>
      ) : null}

      {draft.measurementType === "physical" ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">{rc("unitConverter")}</h3>
          <p className="text-xs text-zinc-500">{rc("physicalMeasurementHint")}</p>
          <select
            value={draft.unitId}
            onChange={(e) => patchDraft({ unitId: e.target.value })}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          >
            <option value="">{rc("unitSelectPlaceholder")}</option>
            {UNIT_REGISTRY.filter((u) => u.conversionSupported).map((u) => (
              <option key={u.id} value={u.id}>
                {u.symbol} — {u.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              value={draft.convValue}
              onChange={(e) => patchDraft({ convValue: e.target.value })}
              placeholder={rc("convValuePlaceholderExample")}
              className={`${cbaiFocusRing} w-20 rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-2 text-sm`}
            />
            <select
              value={draft.convFrom}
              onChange={(e) => patchDraft({ convFrom: e.target.value })}
              className={`${cbaiFocusRing} rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-2 text-sm`}
            >
              {UNIT_REGISTRY.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.symbol}
                </option>
              ))}
            </select>
            <span className="self-center text-zinc-500">→</span>
            <select
              value={draft.convTo}
              onChange={(e) => patchDraft({ convTo: e.target.value })}
              className={`${cbaiFocusRing} rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-2 text-sm`}
            >
              {UNIT_REGISTRY.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.symbol}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={runConvert} className={cbaiBtnPrimary}>
            {rc("convert")}
          </button>
          {conversionResult ? renderCalculationCard(conversionResult) : null}
        </section>
      ) : null}

      {draft.measurementType === "digital" ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">{rc("imageMeasurementPreview")}</h3>
          <p className="text-xs text-zinc-500">{rc("imageMeasurementPreviewNotice")}</p>
          <input
            value={draft.refPixels}
            onChange={(e) => patchDraft({ refPixels: e.target.value })}
            placeholder={rc("referencePixelsPlaceholderExample")}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          />
          <input
            value={draft.refReal}
            onChange={(e) => patchDraft({ refReal: e.target.value })}
            placeholder={rc("referenceRealPlaceholderExample")}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          />
          <input
            value={draft.pixelLength}
            onChange={(e) => patchDraft({ pixelLength: e.target.value })}
            placeholder={rc("pixelLengthPlaceholderExample")}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          />
          <button type="button" onClick={runGeometryCalc} className={cbaiBtnPrimary}>
            {rc("calculateDistance")}
          </button>
          {geometryResult ? renderCalculationCard(geometryResult) : null}
        </section>
      ) : null}

      {draft.measurementType === "chemical" ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">{rc("molecularFormula")}</h3>
          <p className="text-xs text-zinc-500">{rc("molecularUserInputNotice")}</p>
          <input
            value={draft.molecularFormula}
            onChange={(e) => {
              patchDraft({ molecularFormula: e.target.value });
              setMolecularResult(null);
            }}
            placeholder={rc("molecularFormulaPlaceholderExample")}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          />
          <button type="button" onClick={runMolecularCalc} className={cbaiBtnPrimary}>
            {rc("calculateMolecularMass")}
          </button>
          {molecularResult ? (
            <div className="rounded border border-zinc-800 bg-zinc-950/40 p-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-teal-400/90">{rc("provenanceCalculated")}</p>
              <p className="font-medium text-zinc-200">
                {rc("resultCalculated")}: {molecularResult.molecularMass} g/mol
              </p>
              <p className="text-xs text-zinc-500">{rc("molecularFormulaConfirmed")}: {draft.molecularFormula}</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-zinc-500">
                {molecularResult.limitationKeys.map((key) => (
                  <li key={key}>{rc(`molecularLimitation_${key}`)}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`${cbaiFocusRing} mt-2 text-xs text-zinc-400 underline`}
                onClick={() => setShowMolecularTechnical((v) => !v)}
              >
                {rc("technicalDetails")}
              </button>
              {showMolecularTechnical ? (
                <pre className="mt-2 overflow-x-auto text-xs text-zinc-500">
                  {JSON.stringify(molecularResult, null, 2)}
                </pre>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-3 lg:col-span-2">
        <h3 className="text-sm font-semibold text-zinc-200">{rc("measurementPassport")}</h3>
        <p className="text-xs text-zinc-500">{rc("passportCreationNotice")}</p>
        <input
          value={draft.measureResult}
          onChange={(e) => patchDraft({ measureResult: e.target.value })}
          placeholder={rc("resultValuePlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <input
          value={draft.rawDataRef}
          onChange={(e) => patchDraft({ rawDataRef: e.target.value })}
          placeholder={rc("rawDataPlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <input
          value={draft.uncertainty}
          onChange={(e) => patchDraft({ uncertainty: e.target.value })}
          placeholder={rc("uncertaintyPlaceholder")}
          className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
        />
        <button type="button" onClick={addPassport} className={cbaiBtnPrimary}>
          {rc("createPassport")}
        </button>
        <p className="text-xs text-zinc-500">
          {passports.length} {rc("passports").toLowerCase()}
        </p>
        <button type="button" onClick={resetDraft} className={`${cbaiFocusRing} text-xs text-zinc-500`}>
          {rc("resetMeasurementDraft")}
        </button>
      </section>
    </div>
  );
}
