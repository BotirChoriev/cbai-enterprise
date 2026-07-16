"use client";

import { useState } from "react";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import type { EntityRelationship } from "@/lib/entity/entity.types";
import {
  loadResearchNotes,
  saveResearchNote,
  loadResearchFindings,
  saveResearchFinding,
  RESEARCH_NOTES_ARCHITECTURE_NOTE,
  RESEARCH_FINDINGS_ARCHITECTURE_NOTE,
  type PersistedResearchNote,
  type PersistedResearchFinding,
} from "@/lib/research/research-workspace-store";
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
  const [notes, setNotes] = useState<PersistedResearchNote[]>(() => loadResearchNotes(topicId));
  const [findings, setFindings] = useState<PersistedResearchFinding[]>(() => loadResearchFindings(topicId));
  const [noteBody, setNoteBody] = useState("");
  const [noteEvidenceId, setNoteEvidenceId] = useState("");
  const [noteEntityId, setNoteEntityId] = useState("");
  const [findingBody, setFindingBody] = useState("");

  function handleAddNote(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = noteBody.trim();
    if (!trimmed) return;

    const evidence = evidenceItems.find((item) => item.evidenceItemId === noteEvidenceId);
    const entity = relatedEntities.find((rel) => rel.targetId === noteEntityId);

    const note = saveResearchNote({
      topicId,
      body: trimmed,
      linkedEvidenceId: evidence?.evidenceItemId,
      linkedEvidenceLabel: evidence?.label,
      linkedEntityId: entity?.targetId,
      linkedEntityName: entity?.targetName,
      linkedEntityType: entity?.targetType,
    });
    setNotes((current) => [note, ...current]);
    setNoteBody("");
    setNoteEvidenceId("");
    setNoteEntityId("");
  }

  function handleAddFinding(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = findingBody.trim();
    if (!trimmed) return;

    const finding = saveResearchFinding({ topicId, summary: trimmed });
    setFindings((current) => [finding, ...current]);
    setFindingBody("");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Research notes</p>

        <form onSubmit={handleAddNote} className="space-y-2">
          <textarea
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Write a research note…"
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
                <option value="">Link to evidence (optional)</option>
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
                <option value="">Link to entity (optional)</option>
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
              Add note
            </button>
          </div>
        </form>

        {notes.length > 0 ? (
          <ul className="space-y-2 border-t border-zinc-800/80 pt-2">
            {notes.map((note) => (
              <li key={note.noteId} className="text-xs text-zinc-400">
                <p>{note.body}</p>
                <p className="mt-0.5 text-[10px] text-zinc-600">
                  {new Date(note.createdAt).toLocaleString()}
                  {note.linkedEvidenceLabel ? ` · Evidence: ${note.linkedEvidenceLabel}` : ""}
                  {note.linkedEntityName ? ` · Entity: ${note.linkedEntityName}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-600">{RESEARCH_NOTES_ARCHITECTURE_NOTE}</p>
        )}
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Findings</p>

        <form onSubmit={handleAddFinding} className="space-y-2">
          <textarea
            value={findingBody}
            onChange={(e) => setFindingBody(e.target.value)}
            placeholder="Record a finding…"
            rows={2}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
          <button
            type="submit"
            className="rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-medium text-teal-300 hover:border-teal-500/50"
          >
            Add finding
          </button>
        </form>

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
          <p className="text-xs text-zinc-600">{RESEARCH_FINDINGS_ARCHITECTURE_NOTE}</p>
        )}
      </div>
    </div>
  );
}
