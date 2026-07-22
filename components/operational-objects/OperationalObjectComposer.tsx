"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";
import { missingRequiredFields } from "@/lib/operational-objects/command-interpreter";
import type {
  OperationalObjectDomain,
  OperationalObjectType,
} from "@/lib/operational-objects/operational-object.types";
import {
  translateOperationalObjectDomain,
  translateOperationalObjectType,
} from "@/lib/i18n/operational-object-translation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnGhost, cbaiBtnPrimary, cbaiBtnSecondary, cbaiFocusRing } from "@/components/brand/brand-classes";

const OBJECT_TYPES: readonly OperationalObjectType[] = [
  "work_plan",
  "project",
  "mission",
  "task",
  "research_question",
  "evidence_request",
  "review",
  "decision_brief",
  "meeting_action",
];

const DOMAINS: readonly OperationalObjectDomain[] = [
  "general",
  "research",
  "evidence",
  "countries",
  "companies",
  "universities",
  "governance",
  "investor",
  "reports",
  "knowledge",
];

function sourceLabel(
  source: string,
  t: (key: string) => string,
): string {
  if (source === "voice_command") return t("operationalObject.sourceVoice");
  if (source === "typed_command") return t("operationalObject.sourceTyped");
  if (source === "existing_object") return t("operationalObject.sourceExisting");
  return t("operationalObject.sourceManual");
}

function missingFieldLabel(field: string, t: (key: string) => string): string {
  const keys: Record<string, string> = {
    title: "operationalObject.fieldTitle",
    objective: "operationalObject.fieldObjective",
    domain: "operationalObject.fieldDomain",
    nextAction: "operationalObject.fieldNextAction",
    humanDecision: "operationalObject.fieldHumanDecision",
  };
  const key = keys[field];
  return key ? t(key) : field;
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inferred?: boolean;
  missing?: boolean;
  multiline?: boolean;
};

function WorkCardField({ id, label, value, onChange, inferred, missing, multiline }: FieldProps) {
  const className = `cbai-op-field ${missing ? "cbai-op-field--missing" : ""} ${inferred ? "cbai-op-field--inferred" : ""}`;
  return (
    <label htmlFor={id} className={className}>
      <span className="cbai-op-field__label">
        {label}
        {inferred ? <span className="cbai-op-field__tag">∗</span> : null}
        {missing ? <span className="cbai-op-field__missing-tag">!</span> : null}
      </span>
      {multiline ? (
        <textarea
          id={id}
          className={`cbai-op-input ${cbaiFocusRing}`}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className={`cbai-op-input ${cbaiFocusRing}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export default function OperationalObjectComposer() {
  const { t } = useTranslation();
  const titleId = useId();
  const {
    composerOpen,
    draft,
    inferredFields,
    source,
    closeComposer,
    updateDraft,
    saveDraft,
    confirmDraft,
  } = useOperationalObjects();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    if (!composerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeComposer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [composerOpen, closeComposer]);

  if (!composerOpen || !draft) return null;

  const missing = missingRequiredFields(draft);
  const isInferred = (field: string) => inferredFields.includes(field);
  const isMissing = (field: string) => missing.includes(field);

  return (
    <div className="cbai-op-composer-backdrop" role="presentation" onClick={closeComposer}>
      <div
        ref={dialogRef}
        className="cbai-op-composer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cbai-op-composer__header">
          <div>
            <p className="cbai-op-composer__eyebrow">{t("operationalObject.draftLabel")}</p>
            <input
              id={titleId}
              className={`cbai-op-composer__title ${cbaiFocusRing}`}
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              aria-label={t("operationalObject.composerTitle")}
            />
            <p className="cbai-op-composer__source">{sourceLabel(source, t)}</p>
            {draft.provenance.relatedEntityName ? (
              <p className="cbai-op-composer__source">
                {draft.provenance.graphNodeId
                  ? t("operationalObject.linkedFromGraph")
                  : t("operationalObject.linkedFromCountry")}
                : {draft.provenance.relatedEntityName}
              </p>
            ) : null}
          </div>
          <button type="button" className={`cbai-op-close ${cbaiFocusRing}`} onClick={closeComposer}>
            {t("common.close")}
          </button>
        </header>

        <div className="cbai-op-composer__body">
          <div className="cbai-op-composer__type-row">
            <label className="cbai-op-field">
              <span className="cbai-op-field__label">{t("operationalObject.fieldType")}</span>
              <select
                className={`cbai-op-input ${cbaiFocusRing}`}
                value={draft.type}
                onChange={(e) => updateDraft({ type: e.target.value as OperationalObjectType })}
              >
                {OBJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {translateOperationalObjectType(type, t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="cbai-op-field">
              <span className="cbai-op-field__label">{t("operationalObject.fieldDomain")}</span>
              <select
                className={`cbai-op-input ${cbaiFocusRing}`}
                value={draft.domain}
                onChange={(e) => updateDraft({ domain: e.target.value as OperationalObjectDomain })}
              >
                {DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>
                    {translateOperationalObjectDomain(domain, t)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <WorkCardField
            id="op-objective"
            label={t("operationalObject.fieldObjective")}
            value={draft.objective}
            onChange={(objective) => updateDraft({ objective })}
            inferred={isInferred("title") || isInferred("objective")}
            missing={isMissing("objective")}
            multiline
          />
          <WorkCardField
            id="op-outcome"
            label={t("operationalObject.fieldExpectedOutcome")}
            value={draft.expectedOutcome}
            onChange={(expectedOutcome) => updateDraft({ expectedOutcome })}
            inferred={isInferred("expectedOutcome")}
            multiline
          />
          <WorkCardField
            id="op-next"
            label={t("operationalObject.fieldNextAction")}
            value={draft.nextAction}
            onChange={(nextAction) => updateDraft({ nextAction })}
            inferred={isInferred("nextAction")}
            missing={isMissing("nextAction")}
          />
          <WorkCardField
            id="op-inputs"
            label={t("operationalObject.fieldRequiredInputs")}
            value={draft.requiredInputs.join("\n")}
            onChange={(raw) =>
              updateDraft({
                requiredInputs: raw
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
            multiline
          />
          <WorkCardField
            id="op-human"
            label={t("operationalObject.fieldHumanDecision")}
            value={draft.humanDecision}
            onChange={(humanDecision) => updateDraft({ humanDecision })}
            missing={isMissing("humanDecision")}
            multiline
          />

          {missing.length > 0 ? (
            <p className="cbai-op-composer__missing-note" role="status">
              {t("operationalObject.missingHint")}: {missing.map((field) => missingFieldLabel(field, t)).join(", ")}
            </p>
          ) : null}

          <details
            className="cbai-op-composer__advanced"
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="cbai-op-composer__advanced-summary">{t("operationalObject.advancedDetails")}</summary>
            <div className="cbai-op-composer__advanced-body">
              <WorkCardField
                id="op-rationale"
                label={t("operationalObject.fieldRationale")}
                value={draft.rationale}
                onChange={(rationale) => updateDraft({ rationale })}
                multiline
              />
              <WorkCardField
                id="op-evidence"
                label={t("operationalObject.fieldEvidenceRequirements")}
                value={draft.evidenceRequirements.join("\n")}
                onChange={(raw) =>
                  updateDraft({
                    evidenceRequirements: raw
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                  })
                }
                multiline
              />
              <WorkCardField
                id="op-due"
                label={t("operationalObject.fieldDueDate")}
                value={draft.dueAt ?? ""}
                onChange={(dueAt) => updateDraft({ dueAt: dueAt || undefined })}
              />
            </div>
          </details>
        </div>

        <footer className="cbai-op-composer__footer">
          <button type="button" className={cbaiBtnGhost} onClick={closeComposer}>
            {t("operationalObject.cancel")}
          </button>
          <button type="button" className={cbaiBtnSecondary} onClick={() => saveDraft()}>
            {t("operationalObject.saveDraft")}
          </button>
          <button type="button" className={cbaiBtnPrimary} onClick={() => confirmDraft()}>
            {t("operationalObject.confirmCreate")}
          </button>
        </footer>
      </div>
    </div>
  );
}
