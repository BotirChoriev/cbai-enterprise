"use client";

import { useState } from "react";
import type { ContextEntityRef } from "@/lib/context/context-types";
import type { ProjectEvidenceReference, ProjectNote } from "@/lib/project/project-types";
import { loadProjectNotes, saveProjectNote } from "@/lib/project/project-store";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectNotesPanelProps = {
  projectId: string;
  evidence: readonly ProjectEvidenceReference[];
  relatedEntities: readonly ContextEntityRef[];
};

/**
 * Real, persisted Project Notes — every note belongs to this Project, and optionally references
 * a real Evidence reference or a real linked Entity, per the mission's "Notes may reference:
 * Evidence, Entities, Reports" (notes are automatically included in the Project Report, which is
 * how they reference a report — see ProjectNote's own doc comment).
 */
export default function ProjectNotesPanel({ projectId, evidence, relatedEntities }: ProjectNotesPanelProps) {
  const [notes, setNotes] = useState<ProjectNote[]>(() => loadProjectNotes(projectId));
  const [body, setBody] = useState("");
  const [evidenceRefId, setEvidenceRefId] = useState("");
  const [entityId, setEntityId] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    const linkedEvidence = evidence.find((e) => e.evidenceRefId === evidenceRefId);
    const linkedEntity = relatedEntities.find((e) => e.id === entityId);

    const note = saveProjectNote({
      projectId,
      body: trimmed,
      linkedEvidenceId: linkedEvidence?.evidenceRefId,
      linkedEvidenceLabel: linkedEvidence?.title,
      linkedEntityId: linkedEntity?.id,
      linkedEntityName: linkedEntity?.name,
      linkedEntityType: linkedEntity?.kind,
    });
    setNotes((current) => [note, ...current]);
    setBody("");
    setEvidenceRefId("");
    setEntityId("");
  }

  return (
    <section id="project-notes" aria-labelledby="project-notes-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow} id="project-notes-heading">
        Notes
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a project note…"
          rows={2}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
        />
        <div className="flex flex-wrap gap-2">
          {evidence.length > 0 ? (
            <select
              value={evidenceRefId}
              onChange={(e) => setEvidenceRefId(e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-[11px] text-zinc-400"
            >
              <option value="">Link to evidence (optional)</option>
              {evidence.map((e) => (
                <option key={e.evidenceRefId} value={e.evidenceRefId}>
                  {e.title}
                </option>
              ))}
            </select>
          ) : null}
          {relatedEntities.length > 0 ? (
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-[11px] text-zinc-400"
            >
              <option value="">Link to entity (optional)</option>
              {relatedEntities.map((entity) => (
                <option key={`${entity.kind}-${entity.id}`} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="submit"
            className="ml-auto rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300 hover:border-cyan-500/50"
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
        <p className="text-xs text-zinc-600">No notes recorded yet for this project.</p>
      )}
    </section>
  );
}
