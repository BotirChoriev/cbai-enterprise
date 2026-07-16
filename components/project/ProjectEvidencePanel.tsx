"use client";

import { useState } from "react";
import type { ContextEntityRef } from "@/lib/context/context-types";
import type { ProjectEvidenceReference } from "@/lib/project/project-types";
import { loadProjectEvidence, saveProjectEvidence } from "@/lib/project/project-store";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import EmptyState from "@/components/shared/EmptyState";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type ProjectEvidencePanelProps = {
  projectId: string;
  relatedEntities: readonly ContextEntityRef[];
  onAdded?: (item: ProjectEvidenceReference) => void;
};

export default function ProjectEvidencePanel({ projectId, relatedEntities, onAdded }: ProjectEvidencePanelProps) {
  const { t } = useTranslation();
  const [evidence, setEvidence] = useState<ProjectEvidenceReference[]>(() => loadProjectEvidence(projectId));
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [entityId, setEntityId] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

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
    setSavedMessage(t("projectPanel.evidenceAdded"));
    onAdded?.(record);
  }

  return (
    <section id="project-evidence" aria-labelledby="project-evidence-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div>
        <p className={cbaiSectionEyebrow} id="project-evidence-heading">
          {t("projectPanel.evidenceEyebrow")}
        </p>
        <p className="mt-1 text-xs text-zinc-600">{t("projectPanel.evidenceLead")}</p>
      </div>

      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("projectPanel.evidenceTitlePlaceholder")}
            aria-label={t("projectPanel.evidenceTitlePlaceholder")}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder={t("projectPanel.evidenceUrlPlaceholder")}
            aria-label={t("projectPanel.evidenceUrlPlaceholder")}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {relatedEntities.length > 0 ? (
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              aria-label={t("projectPanel.linkEntityOptional")}
              className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-[11px] text-zinc-400"
            >
              <option value="">{t("projectPanel.linkEntityOptional")}</option>
              {relatedEntities.map((entity) => (
                <option key={`${entity.kind}-${entity.id}`} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="submit"
            className="ml-auto rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-medium text-teal-300 hover:border-teal-500/50"
          >
            {t("projectPanel.addEvidence")}
          </button>
        </div>
      </form>

      {savedMessage ? <ActivationStatusLine message={savedMessage} compact /> : null}

      {evidence.length > 0 ? (
        <ul className="space-y-2 border-t border-zinc-800/80 pt-2">
          {evidence.map((item) => (
            <li key={item.evidenceRefId} className="text-xs text-zinc-400">
              {item.sourceUrl ? (
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
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
        <EmptyState variant="section" message={t("projectPanel.evidenceEmpty")} />
      )}
    </section>
  );
}
