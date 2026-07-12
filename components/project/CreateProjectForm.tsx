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

type CreateProjectFormProps = {
  /** Pre-fills the primary entity when arriving from an entity profile — real, never fabricated. */
  initialPrimaryEntity?: ContextEntityRef;
  onCreated?: (projectId: string) => void;
};

const REAL_VISIBILITY_OPTIONS: readonly ProjectVisibility[] = ["private", "team", "public"];
const REAL_STATUS_OPTIONS: readonly ProjectStatus[] = ["active", "paused", "completed", "archived"];

/**
 * Real Project creation — the only required fields are Title, Project Type, Description,
 * Visibility, and Status per the mission; Primary Entity and Tags are optional. Visibility only
 * has one real, working value ("Private" — this device only, no account system exists); Team and
 * Public are shown honestly as Planned, not offered as if they work.
 */
export default function CreateProjectForm({ initialPrimaryEntity, onCreated }: CreateProjectFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProjectTypeId>(PROJECT_TYPES[0].id);
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
      setError("Title and Description are required.");
      return;
    }
    if (visibility !== "private") {
      setError("Team and Public visibility are Planned — not available yet. Choose Private to continue.");
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
          New Project
        </p>
        {initialPrimaryEntity ? (
          <p className="mt-1 text-xs text-zinc-500">
            Primary entity: <span className="text-zinc-300">{initialPrimaryEntity.name}</span>
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="project-title" className="text-xs text-zinc-500">
            Title
          </label>
          <input
            id="project-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title"
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="project-type" className="text-xs text-zinc-500">
              Project Type
            </label>
            <select
              id="project-type"
              value={type}
              onChange={(e) => setType(e.target.value as ProjectTypeId)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="project-status" className="text-xs text-zinc-500">
              Status
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
            Description
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What is this project about?"
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="project-tags" className="text-xs text-zinc-500">
              Tags (comma-separated, optional)
            </label>
            <input
              id="project-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. semiconductors, policy"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
            />
          </div>

          <div>
            <label htmlFor="project-visibility" className="text-xs text-zinc-500">
              Visibility
            </label>
            <select
              id="project-visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ProjectVisibility)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200"
            >
              {REAL_VISIBILITY_OPTIONS.map((v) => (
                <option key={v} value={v}>
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
          Create Project
        </button>
      </form>
    </section>
  );
}
