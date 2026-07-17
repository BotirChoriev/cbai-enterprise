"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { CanonicalKnowledgeSource } from "@/lib/knowledge-connectors/types";
import type { SavedKnowledgeSource } from "@/lib/knowledge-ingestion/source-ingestion.types";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { findDuplicateSavedSource } from "@/lib/knowledge-ingestion/source-deduplication";
import {
  linkSavedSourceToMission,
  loadSavedKnowledgeSources,
  requestSavedSourceReview,
  saveKnowledgeSourceFromCanonical,
} from "@/lib/knowledge-ingestion/saved-source-store";
import { loadMissions } from "@/lib/intelligence-os/mission-store";
import { deriveKnowledgeTrustStateFromSavedSource } from "@/lib/intelligence-os/trust-derivation";
import { recordWorkflowEvent } from "@/lib/telemetry/workflow-telemetry";
import SourceReviewDialog from "@/components/knowledge/SourceReviewDialog";
import { cbaiBtnPrimary, cbaiFocusRing } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type KnowledgeSourceResultCardProps = {
  readonly record: CanonicalKnowledgeSource;
  readonly refreshKey: number;
  readonly mission: Mission | null;
  readonly reviewerDisplayName: string;
  readonly onMutation: () => void;
};

function lifecycleLabel(
  saved: SavedKnowledgeSource | null,
  inspected: boolean,
  t: (path: string) => string,
): string {
  if (!saved) return inspected ? t("sourceIngestion.liveCrossrefMetadata") : t("sourceIngestion.liveCrossrefMetadata");
  switch (saved.lifecycleState) {
    case "saved_source":
      return t("sourceIngestion.savedInCbai");
    case "linked_to_mission":
      return t("sourceIngestion.linkedToMission");
    case "awaiting_review":
      return t("sourceIngestion.awaitingReview");
    case "reviewed_evidence":
      return t("sourceIngestion.reviewedEvidence");
    case "rejected":
      return t("sourceIngestion.rejected");
    default:
      return t("sourceIngestion.liveCrossrefMetadata");
  }
}

export default function KnowledgeSourceResultCard({
  record,
  refreshKey,
  mission,
  reviewerDisplayName,
  onMutation,
}: KnowledgeSourceResultCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string>("");

  const saved = useMemo(() => {
    void refreshKey;
    return findDuplicateSavedSource(loadSavedKnowledgeSources(), record);
  }, [record, refreshKey]);

  const missions = useMemo(() => {
    void refreshKey;
    return loadMissions().filter((m) => m.status === "active" || m.status === "paused");
  }, [refreshKey]);

  const trust = saved ? deriveKnowledgeTrustStateFromSavedSource(saved) : null;
  const doi =
    record.identifiers.find((id) => id.scheme.toLowerCase() === "doi")?.value ?? record.canonicalId;

  const inspect = useCallback(() => {
    setExpanded(true);
    recordWorkflowEvent("source_result_inspected", {
      objectType: "source",
      objectId: record.canonicalId ?? record.id,
    });
  }, [record]);

  const save = useCallback(() => {
    setBusy(true);
    setError(null);
    recordWorkflowEvent("source_save_started", { objectType: "source", objectId: record.id });
    const result = saveKnowledgeSourceFromCanonical(record);
    setBusy(false);
    if (!result.ok) {
      setError(t("sourceIngestion.saveFailed"));
      recordWorkflowEvent("source_save_failed", { objectType: "source", objectId: record.id });
      return;
    }
    setFeedback(result.duplicate ? t("sourceIngestion.duplicate") : t("sourceIngestion.saved"));
    onMutation();
  }, [record, t, onMutation]);

  const linkMission = useCallback(() => {
    if (!saved) return;
    const missionId = mission?.id ?? selectedMissionId;
    if (!missionId) {
      setError(t("sourceIngestion.noActiveMission"));
      return;
    }
    setBusy(true);
    setError(null);
    recordWorkflowEvent("source_link_started", { objectType: "saved_source", objectId: saved.id });
    const updated = linkSavedSourceToMission(saved.id, missionId);
    setBusy(false);
    if (!updated) {
      setError(t("sourceIngestion.linkFailed"));
      recordWorkflowEvent("source_link_failed", { objectType: "saved_source", objectId: saved.id });
      return;
    }
    setFeedback(t("sourceIngestion.linked"));
    onMutation();
  }, [saved, mission, selectedMissionId, t, onMutation]);

  const requestReview = useCallback(() => {
    if (!saved) return;
    setBusy(true);
    const updated = requestSavedSourceReview(saved.id);
    setBusy(false);
    if (!updated) {
      setError(t("sourceIngestion.reviewFailed"));
      return;
    }
    setFeedback(t("sourceIngestion.reviewRequested"));
    onMutation();
  }, [saved, t, onMutation]);

  const primaryAction = useMemo(() => {
    if (!saved) {
      return expanded ? { label: t("sourceIngestion.saveSource"), action: save } : { label: t("sourceIngestion.inspect"), action: inspect };
    }
    switch (saved.lifecycleState) {
      case "saved_source":
        return { label: t("sourceIngestion.linkToMission"), action: linkMission };
      case "linked_to_mission":
        return { label: t("sourceIngestion.sendForReview"), action: requestReview };
      case "awaiting_review":
        return { label: t("sourceIngestion.beginReview"), action: () => setReviewOpen(true) };
      case "reviewed_evidence":
        return saved.projectEvidenceRefId
          ? {
              label: t("sourceIngestion.openEvidenceContext"),
              action: null,
              href: mission?.projectId
                ? `/my-work?project=${mission.projectId}#project-evidence`
                : "/knowledge",
            }
          : { label: t("sourceIngestion.viewReview"), action: () => setReviewOpen(true) };
      case "rejected":
        return { label: t("sourceIngestion.viewReview"), action: () => setReviewOpen(true) };
      default:
        return { label: t("sourceIngestion.inspect"), action: inspect };
    }
  }, [saved, expanded, t, save, inspect, linkMission, requestReview, mission]);

  return (
    <li className="rounded-md border border-zinc-800/80 bg-zinc-950/40 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-zinc-200">{record.title}</h3>
          {record.authors.length > 0 ? (
            <p className="mt-1 text-xs text-zinc-500">{record.authors.join("; ")}</p>
          ) : (
            <p className="mt-1 text-xs text-zinc-600">{t("sourceIngestion.authorsUnknown")}</p>
          )}
          <p className="mt-1 text-[10px] text-zinc-600">
            {record.publicationDate ?? t("sourceIngestion.publicationDateUnknown")} ·{" "}
            {lifecycleLabel(saved, expanded, t)} · {t("sourceIngestion.needsReviewBeforeEvidence")}
          </p>
        </div>
        <span className="shrink-0 rounded border border-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
          {saved?.lifecycleState ?? (expanded ? "inspected" : "search_result")}
        </span>
      </div>

      {expanded ? (
        <div className="mt-3 space-y-2 border-t border-zinc-800/60 pt-3 text-xs text-zinc-400">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-zinc-600">{t("sourceIngestion.providerCrossref")}</dt>
              <dd>{record.provenance.originalSourceName}</dd>
            </div>
            {doi ? (
              <div>
                <dt className="text-zinc-600">{t("sourceIngestion.doiLabel")}</dt>
                <dd>{doi}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-zinc-600">{t("sourceIngestion.dateLabel")}</dt>
              <dd>{record.publicationDate ?? t("sourceIngestion.publicationDateUnknown")}</dd>
            </div>
            <div>
              <dt className="text-zinc-600">{t("sourceIngestion.lifecycle")}</dt>
              <dd>{saved?.lifecycleState ?? (expanded ? "inspected" : "search_result")}</dd>
            </div>
          </dl>
          {record.abstract?.trim() ? (
            <p>
              <span className="text-zinc-600">{t("sourceIngestion.abstractProviderSupplied")}: </span>
              {record.abstract}
            </p>
          ) : (
            <p className="text-zinc-600">{t("sourceIngestion.abstractNotSupplied")}</p>
          )}
          {record.limitations.length > 0 ? (
            <div>
              <p className="text-zinc-600">{t("sourceIngestion.limitations")}</p>
              <ul className="list-inside list-disc">
                {record.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {trust ? (
            <p className="text-zinc-500">
              {t("sourceIngestion.provenance")}: {trust.reasons.map((r) => r.message).join(" ")}
            </p>
          ) : null}
          {record.landingPageUrl ? (
            <a
              href={record.landingPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-teal-400 hover:text-teal-300"
            >
              {t("sourceIngestion.viewProviderRecord")} →
            </a>
          ) : null}
        </div>
      ) : null}

      {saved?.lifecycleState === "saved_source" && !mission && missions.length > 0 ? (
        <div className="mt-3">
          <label htmlFor={`mission-${record.id}`} className="text-xs text-zinc-500">
            {t("sourceIngestion.chooseMission")}
          </label>
          <select
            id={`mission-${record.id}`}
            value={selectedMissionId}
            onChange={(e) => setSelectedMissionId(e.target.value)}
            className={`mt-1 min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-200 ${cbaiFocusRing}`}
          >
            <option value="">{t("sourceIngestion.chooseMission")}</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.problem.slice(0, 80)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {mission && saved?.lifecycleState === "saved_source" ? (
        <p className="mt-2 text-xs text-zinc-500">
          {t("sourceIngestion.activeMission")}: {mission.problem.slice(0, 80)}
        </p>
      ) : null}

      {feedback ? (
        <p className="mt-2 text-xs text-teal-400/90" role="status">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-amber-400/90" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {"href" in primaryAction && primaryAction.href ? (
          <Link href={primaryAction.href} className={`${cbaiBtnPrimary} inline-flex min-h-10 items-center px-4 text-sm`}>
            {primaryAction.label}
          </Link>
        ) : primaryAction.action ? (
          <button
            type="button"
            disabled={busy}
            onClick={primaryAction.action}
            className={`${cbaiBtnPrimary} min-h-10`}
          >
            {busy ? t("common.loading") : primaryAction.label}
          </button>
        ) : null}
        {expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className={`min-h-10 rounded-md border border-zinc-700 px-4 text-sm text-zinc-400 ${cbaiFocusRing}`}
          >
            {t("sourceIngestion.closeInspect")}
          </button>
        ) : null}
      </div>

      {saved && (mission?.id ?? saved.missionRelations[0]?.missionId ?? selectedMissionId) ? (
        <SourceReviewDialog
          open={reviewOpen}
          sourceId={saved.id}
          missionId={mission?.id ?? saved.missionRelations[0]!.missionId ?? selectedMissionId}
          reviewerDisplayName={reviewerDisplayName}
          onClose={() => setReviewOpen(false)}
          onCompleted={() => {
            setFeedback(t("sourceIngestion.submitReview"));
            onMutation();
          }}
        />
      ) : null}
    </li>
  );
}
