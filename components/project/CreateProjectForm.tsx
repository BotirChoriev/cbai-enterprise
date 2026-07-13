"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PROJECT_TYPES,
  PROJECT_STATUS_LABELS,
  PROJECT_VISIBILITY_LABELS,
  type ProjectTypeId,
  type ProjectStatus,
  type ProjectVisibility,
} from "@/lib/project/project-types";
import { createProject } from "@/lib/project/project-store";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type CreateProjectFormProps = {
  /** Pre-fills the primary entity when arriving from an entity profile — real, never fabricated. */
  initialPrimaryEntity?: ContextEntityRef;
  /** Pre-selects a real Project Type — e.g. arriving from a role entry surface (Government ->
   * Policy Analysis). Falls back to the first catalog type when omitted or invalid. */
  initialType?: ProjectTypeId;
  onCreated?: (projectId: string) => void;
};

const REAL_VISIBILITY_OPTIONS: readonly ProjectVisibility[] = ["private", "team", "public"];
const REAL_STATUS_OPTIONS: readonly ProjectStatus[] = ["active", "paused", "completed", "archived"];

function isProjectTypeId(value: string | undefined): value is ProjectTypeId {
  return PROJECT_TYPES.some((t) => t.id === value);
}

/**
 * Real Project creation — the only required fields are Title, Project Type, Description,
 * Visibility, and Status per the mission; Primary Entity and Tags are optional. Visibility only
 * has one real, working value ("Private" — this device only): a real local account system exists
 * (lib/auth/), but there is still no cloud backend to share a Team/Public project through, so
 * those options are disabled rather than offered as if they work.
 */
export default function CreateProjectForm({ initialPrimaryEntity, initialType, onCreated }: CreateProjectFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProjectTypeId>(isProjectTypeId(initialType) ? initialType : PROJECT_TYPES[0].id);
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>("private");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle || !trimmedDescription) {
      setError(t("project.form.requiredError"));
      return;
    }
    if (visibility !== "private") {
      setError(t("project.form.visibilityError"));
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const project = createProject({
      title: trimmedTitle,
      type,
      description: trimmedDescription,
      primaryEntity: initialPrimaryEntity,
      tags,
      visibility,
      status,
    });

    setError(null);
    if (onCreated) {
      onCreated(project.id);
    } else {
      router.push(`/my-work?project=${project.id}`);
    }
  }

  return (
    <section aria-labelledby="create-project-heading" className={`${cbaiGlassCard} space-y-4 p-4 sm:p-5`}>
      <div>
        <p className={cbaiSectionEyebrow} id="create-project-heading">
          {t("project.form.heading")}
        </p>
        {initialPrimaryEntity ? (
          <p className="mt-1 text-xs text-zinc-500">
            {t("project.form.primaryEntityLabel")}: <span className="text-zinc-300">{initialPrimaryEntity.name}</span>
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="project-title" className="text-xs text-zinc-500">
            {t("project.form.titleLabel")}
          </label>
          <input
            id="project-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("project.form.titlePlaceholder")}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="project-type" className="text-xs text-zinc-500">
              {t("project.form.typeLabel")}
            </label>
            <select
              id="project-type"
              value={type}
              onChange={(e) => setType(e.target.value as ProjectTypeId)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200"
            >
              {PROJECT_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-zinc-600">
              {PROJECT_TYPES.find((option) => option.id === type)?.description}
            </p>
          </div>

          <div>
            <label htmlFor="project-status" className="text-xs text-zinc-500">
              {t("project.form.statusLabel")}
            </label>
            <select
              id="project-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200"
            >
              {REAL_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="project-description" className="text-xs text-zinc-500">
            {t("project.form.descriptionLabel")}
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder={t("project.form.descriptionPlaceholder")}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="project-tags" className="text-xs text-zinc-500">
              {t("project.form.tagsLabel")}
            </label>
            <input
              id="project-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t("project.form.tagsPlaceholder")}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
            />
          </div>

          <div>
            <label htmlFor="project-visibility" className="text-xs text-zinc-500">
              {t("project.form.visibilityLabel")}
            </label>
            <select
              id="project-visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ProjectVisibility)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200"
            >
              {REAL_VISIBILITY_OPTIONS.map((v) => (
                <option key={v} value={v} disabled={v !== "private"}>
                  {PROJECT_VISIBILITY_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        <button
          type="submit"
          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 hover:border-cyan-500/50"
        >
          {t("project.form.submit")}
        </button>
      </form>
    </section>
  );
}
