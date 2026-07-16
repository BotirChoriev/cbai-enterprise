"use client";

import { useMemo, useState } from "react";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import type { EntityRelationship } from "@/lib/entity/entity.types";
import {
  loadResearchNotes,
  saveResearchNote,
  loadResearchFindings,
  saveResearchFinding,
} from "@/lib/research/research-workspace-store";
import EmptyState from "@/components/shared/EmptyState";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionDataRevision } from "@/lib/hooks/use-mission-data-revision";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchNotesPanelProps = {
  topicId: string;
  evidenceItems: readonly TopicEvidenceCatalogItem[];
  relatedEntities: readonly EntityRelationship[];
};

/**
 * Real, persisted Research Notes and Findings — the create form and lists that
 * `lib/research/intelligence/review-workspace-model.ts`'s always-empty `ResearchNote`/
 * `ResearchFinding` types needed. Every note belongs to this Research topic, this Workspace, and
 * optionally a real Evidence item or a real related Entity — never a fabricated link.
 */
export default function ResearchNotesPanel({ topicId, evidenceItems, relatedEntities }: ResearchNotesPanelProps) {
  const { t } = useTranslation();
  const revision = useMissionDataRevision();
  const notes = useMemo(() => loadResearchNotes(topicId), [topicId, revision]);
  const findings = useMemo(() => loadResearchFindings(topicId), [topicId, revision]);
  const [noteBody, setNoteBody] = useState("");
  const [noteEvidenceId, setNoteEvidenceId] = useState("");
  const [noteEntityId, setNoteEntityId] = useState("");
  const [findingBody, setFindingBody] = useState("");
  const [noteStatus, setNoteStatus] = useState<string | null>(null);
  const [findingStatus, setFindingStatus] = useState<string | null>(null);

  function handleAddNote(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = noteBody.trim();
    if (!trimmed) return;

    const evidence = evidenceItems.find((item) => item.evidenceItemId === noteEvidenceId);
    const entity = relatedEntities.find((rel) => rel.targetId === noteEntityId);

    saveResearchNote({
      topicId,
      body: trimmed,
      linkedEvidenceId: evidence?.evidenceItemId,
      linkedEvidenceLabel: evidence?.label,
      linkedEntityId: entity?.targetId,
      linkedEntityName: entity?.targetName,
      linkedEntityType: entity?.targetType,
    });
    setNoteBody("");
    setNoteEvidenceId("");
    setNoteEntityId("");
    setNoteStatus(t("activation.noteSaved"));
  }

  function handleAddFinding(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = findingBody.trim();
    if (!trimmed) return;

    saveResearchFinding({ topicId, summary: trimmed });
    setFindingBody("");
    setFindingStatus(t("researchNotes.findingSaved"));
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>{t("researchNotes.notesEyebrow")}</p>

        <form onSubmit={handleAddNote} className="space-y-2">
          <textarea
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder={t("researchNotes.notePlaceholder")}
            rows={2}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
          <div className="flex flex-wrap gap-2">
            {evidenceItems.length > 0 ? (
              <select
                value={noteEvidenceId}
                onChange={(e) => setNoteEvidenceId(e.target.value)}
                className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-[11px] text-zinc-400"
              >
                <option value="">{t("researchNotes.linkEvidenceOptional")}</option>
                {evidenceItems.map((item) => (
                  <option key={item.evidenceItemId} value={item.evidenceItemId}>
                    {item.label}
                  </option>
                ))}
              </select>
            ) : null}
            {relatedEntities.length > 0 ? (
              <select
                value={noteEntityId}
                onChange={(e) => setNoteEntityId(e.target.value)}
                className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-[11px] text-zinc-400"
              >
                <option value="">{t("researchNotes.linkEntityOptional")}</option>
                {relatedEntities.map((rel) => (
                  <option key={rel.targetId} value={rel.targetId}>
                    {rel.targetName}
                  </option>
                ))}
              </select>
            ) : null}
            <button
              type="submit"
              className="ml-auto rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-medium text-teal-300 hover:border-teal-500/50"
            >
              {t("researchNotes.addNote")}
            </button>
          </div>
        </form>

        {noteStatus ? <ActivationStatusLine message={noteStatus} compact /> : null}

        {notes.length > 0 ? (
          <ul className="space-y-2 border-t border-zinc-800/80 pt-2">
            {notes.map((note) => (
              <li key={note.noteId} className="text-xs text-zinc-400">
                <p>{note.body}</p>
                <p className="mt-0.5 text-[10px] text-zinc-600">
                  {new Date(note.createdAt).toLocaleString()}
                  {note.linkedEvidenceLabel
                    ? ` · ${t("researchNotes.evidenceLinked", { label: note.linkedEvidenceLabel })}`
                    : ""}
                  {note.linkedEntityName
                    ? ` · ${t("researchNotes.entityLinked", { name: note.linkedEntityName })}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState variant="dashed" message={t("researchNotes.notesEmpty")} />
        )}
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>{t("researchNotes.findingsEyebrow")}</p>

        <form onSubmit={handleAddFinding} className="space-y-2">
          <textarea
            value={findingBody}
            onChange={(e) => setFindingBody(e.target.value)}
            placeholder={t("researchNotes.findingPlaceholder")}
            rows={2}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
          <button
            type="submit"
            className="rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-medium text-teal-300 hover:border-teal-500/50"
          >
            {t("researchNotes.addFinding")}
          </button>
        </form>

        {findingStatus ? <ActivationStatusLine message={findingStatus} compact /> : null}

        {findings.length > 0 ? (
          <ul className="space-y-2 border-t border-zinc-800/80 pt-2">
            {findings.map((finding) => (
              <li key={finding.findingId} className="text-xs text-zinc-400">
                <p>{finding.summary}</p>
                <p className="mt-0.5 text-[10px] text-zinc-600">{new Date(finding.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState variant="dashed" message={t("researchNotes.findingsEmpty")} />
        )}
      </div>
    </div>
  );
}
