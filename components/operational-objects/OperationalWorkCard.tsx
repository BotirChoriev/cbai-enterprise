"use client";

import Link from "next/link";
import { useState } from "react";
import type { OperationalObject } from "@/lib/operational-objects/operational-object.types";
import { routeOperationalObject } from "@/lib/operational-objects/operational-object-routing";
import {
  translateOperationalObjectDomain,
  translateOperationalObjectStatus,
  translateOperationalObjectType,
} from "@/lib/i18n/operational-object-translation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";
import { cbaiFocusRing } from "@/components/brand/brand-classes";
import EvidenceConnectAction from "@/components/evidence/EvidenceConnectAction";

type OperationalWorkCardProps = {
  readonly object: OperationalObject;
  readonly mode?: "compact" | "standard" | "mobile";
  readonly focused?: boolean;
};

export default function OperationalWorkCard({
  object,
  mode = "standard",
  focused = false,
}: OperationalWorkCardProps) {
  const { t } = useTranslation();
  const { openComposer, archiveObject, reopenObject } = useOperationalObjects();
  const [expanded, setExpanded] = useState(focused);
  const route = routeOperationalObject(object);
  const completedSteps = object.requiredInputs.filter(Boolean).length;
  const totalSteps = Math.max(object.requiredInputs.length, 1);
  const progressPct = object.status === "completed" ? 100 : Math.round((completedSteps / totalSteps) * 100);
  const isArchived = object.status === "archived" || object.status === "completed";
  const known = object.knownInformation ?? [];
  const unknown = object.missingInformation ?? [];
  const blockers =
    object.status === "blocked" || object.status === "waiting_for_evidence"
      ? object.evidenceRequirements
      : [];

  function onEdit() {
    openComposer(
      {
        ...object,
        provenance: object.provenance,
      },
      [],
      "existing_object",
    );
  }

  function onArchive() {
    const message = t("operationalObject.archiveConfirm");
    if (typeof window !== "undefined" && !window.confirm(message)) return;
    archiveObject(object.id);
  }

  function onReopen() {
    reopenObject(object.id);
  }

  return (
    <article
      className={`cbai-op-work-card cbai-op-work-card--${mode}${focused ? " cbai-op-work-card--focused" : ""}`}
      data-op-id={object.id}
      data-op-status={object.status}
      data-op-focused={focused ? "1" : "0"}
    >
      <div className="cbai-op-work-card__head">
        <div>
          <p className="cbai-op-work-card__type">
            {translateOperationalObjectType(object.type, t)} · {translateOperationalObjectDomain(object.domain, t)}
            {object.locale ? ` · ${object.locale.toUpperCase()}` : null}
          </p>
          <h3 className="cbai-op-work-card__title" data-op-focus-target="" tabIndex={-1}>
            {object.title || t("operationalObject.untitled")}
          </h3>
        </div>
        <span className="cbai-op-work-card__status">{translateOperationalObjectStatus(object.status, t)}</span>
      </div>

      <p className="cbai-op-work-card__next">
        <span className="text-[var(--cbai-text-muted)]">{t("operationalObject.fieldNextAction")}: </span>
        {object.nextAction || "—"}
      </p>

      {mode !== "compact" && object.requiredInputs.length > 0 ? (
        <p className="cbai-op-work-card__progress">
          {t("operationalObject.progressLabel")}: {progressPct}%
        </p>
      ) : null}

      {mode !== "compact" ? (
        <p className="cbai-op-work-card__updated">
          {t("operationalObject.lastUpdated")}: {new Date(object.updatedAt).toLocaleString()}
          {object.provenance.relatedEntityName ? (
            <span className="ml-2 text-[var(--cbai-text-muted)]">
              · {object.provenance.relatedEntityName}
            </span>
          ) : null}
        </p>
      ) : null}

      {mode !== "compact" && (known.length > 0 || unknown.length > 0 || blockers.length > 0) ? (
        <div className="cbai-op-work-card__ku mb-2 space-y-1 text-[11px] text-[var(--cbai-text-muted)]">
          {known.length > 0 ? (
            <p>
              <span className="font-medium text-[var(--cbai-text-secondary)]">{t("operationalObject.knownLabel")}: </span>
              {known.slice(0, 2).join("; ")}
            </p>
          ) : null}
          {unknown.length > 0 ? (
            <p>
              <span className="font-medium text-[var(--cbai-text-secondary)]">{t("operationalObject.unknownLabel")}: </span>
              {unknown.slice(0, 2).join("; ")}
            </p>
          ) : null}
          {blockers.length > 0 ? (
            <p>
              <span className="font-medium text-[var(--cbai-text-secondary)]">{t("operationalObject.blockerLabel")}: </span>
              {blockers.slice(0, 2).join("; ")}
            </p>
          ) : null}
        </div>
      ) : null}

      {expanded ? (
        <div className="cbai-op-work-card__details">
          {object.objective ? <p>{object.objective}</p> : null}
          {object.expectedOutcome ? <p>{object.expectedOutcome}</p> : null}
          {object.humanDecision ? <p>{object.humanDecision}</p> : null}
          {object.provenance.source ? (
            <p className="text-[11px] text-[var(--cbai-text-muted)]">
              {t(`operationalObject.source${object.provenance.source === "typed_command" ? "Typed" : object.provenance.source === "voice_command" ? "Voice" : object.provenance.source === "existing_object" ? "Existing" : "Manual"}`)}
            </p>
          ) : null}
          {object.type === "evidence_request" ? (
            <div className="mt-2">
              <EvidenceConnectAction
                category={object.evidenceRequirements[0] ?? object.title}
                relatedEntityName={object.provenance.relatedEntityName}
                relatedEntityKind={object.provenance.relatedEntityKind}
                relatedEntityId={object.provenance.relatedEntityId}
                compact
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="cbai-op-work-card__actions">
        {mode !== "compact" ? (
          <button
            type="button"
            className={`cbai-op-work-card__toggle ${cbaiFocusRing}`}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? t("operationalObject.collapseDetails") : t("operationalObject.expandDetails")}
          </button>
        ) : null}
        <button type="button" className={`cbai-op-work-card__toggle ${cbaiFocusRing}`} onClick={onEdit}>
          {t("operationalObject.editDraft")}
        </button>
        {isArchived ? (
          <button type="button" className={`cbai-op-work-card__toggle ${cbaiFocusRing}`} onClick={onReopen}>
            {t("operationalObject.reopen")}
          </button>
        ) : (
          <button type="button" className={`cbai-op-work-card__toggle ${cbaiFocusRing}`} onClick={onArchive}>
            {t("operationalObject.archive")}
          </button>
        )}
        <Link href={route.href} className={`cbai-op-work-card__primary ${cbaiFocusRing}`}>
          {t("operationalObject.continueAction")}
        </Link>
      </div>
    </article>
  );
}
