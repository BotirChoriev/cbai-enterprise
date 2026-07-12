"use client";

import { useState } from "react";
import type { ContextEntityRef } from "@/lib/context/context-types";
import type { ProjectEvidenceReference } from "@/lib/project/project-types";
import { loadProjectEvidence, saveProjectEvidence } from "@/lib/project/project-store";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectEvidencePanelProps = {
  projectId: string;
  relatedEntities: readonly ContextEntityRef[];
};

/**
 * Evidence belongs to Projects (real, user-authored evidence references — a title and optional
 * source URL, never an automatically fabricated evidence item) — and can still belong to
 * Entities, satisfied elsewhere by every Country/Company/University/Research topic's own real
 * coverage/evidence sections, unaffected by this panel.
 */
export default function ProjectEvidencePanel({ projectId, relatedEntities }: ProjectEvidencePanelProps) {
  const [evidence, setEvidence] = useState<ProjectEvidenceReference[]>(() => loadProjectEvidence(projectId));
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [entityId, setEntityId] = useState("");

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const linkedEntity = relatedEntities.find((e) => e.id === entityId);
    const record = saveProjectEvidence({
      projectId,
      title: trimmed,
      sourceUrl: sourceUrl.trim() || undefined,
      linkedEntityId: linkedEntity?.id,
      linkedEntityName: linkedEntity?.name,
    });
    setEvidence((current) => [record, ...current]);
    setTitle("");
    setSourceUrl("");
    setEntityId("");
  }

  return (
    <section id="project-evidence" aria-labelledby="project-evidence-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div>
        <p className={cbaiSectionEyebrow} id="project-evidence-heading">
          Evidence
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Real, user-added evidence references for this project — never an automated discovery.
        </p>
      </div>

      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Evidence title"
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
          />
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Source URL (optional)"
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
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
            Add evidence
          </button>
        </div>
      </form>

      {evidence.length > 0 ? (
        <ul className="space-y-2 border-t border-zinc-800/80 pt-2">
          {evidence.map((item) => (
            <li key={item.evidenceRefId} className="text-xs text-zinc-400">
              {item.sourceUrl ? (
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                  {item.title}
                </a>
              ) : (
                <span className="text-zinc-300">{item.title}</span>
              )}
              <p className="mt-0.5 text-[10px] text-zinc-600">
                {new Date(item.createdAt).toLocaleString()}
                {item.linkedEntityName ? ` · ${item.linkedEntityName}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-600">No evidence added yet.</p>
      )}
    </section>
  );
}
