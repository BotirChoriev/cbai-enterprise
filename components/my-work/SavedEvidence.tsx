"use client";

import Link from "next/link";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { evidenceItemHref, evidenceItemTopicName } from "@/lib/research/evidence/evidence-bookmark";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type SavedEvidenceProps = {
  entities: readonly ContextEntityRef[];
};

/**
 * Saved Evidence (Platform Activation mission, "Close the final documented product gaps") — the
 * subset of the real bookmark list (kind: "evidence") shown in its own, clearly-labeled My Work
 * section, deliberately separate from PinnedEntities (country/company/university/research_topic/
 * project bookmarks) and from a Project's own linked evidence (ProjectEvidenceReference, shown
 * inside that specific project's workspace) — a bookmarked Evidence item belongs to the user
 * across every project, not to any one project's report.
 */
export default function SavedEvidence({ entities }: SavedEvidenceProps) {
  const { unpinEntityFromWorkspace } = usePlatformContext();

  return (
    <section aria-labelledby="saved-evidence-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div>
        <p className={cbaiSectionEyebrow} id="saved-evidence-heading">
          Saved Evidence
        </p>
        <p className="mt-1 text-[11px] text-zinc-600">
          Evidence you&apos;ve bookmarked from any research topic — separate from evidence you&apos;ve
          added directly to a specific project.
        </p>
      </div>

      {entities.length > 0 ? (
        <ul className="space-y-2">
          {entities.map((entity) => {
            const topicName = evidenceItemTopicName(entity.id);
            return (
              <li
                key={entity.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <Link href={evidenceItemHref(entity.id)} className="text-sm text-cyan-400 hover:text-cyan-300">
                    {entity.name}
                  </Link>
                  {topicName ? <p className="mt-0.5 text-[11px] text-zinc-600">From: {topicName}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => unpinEntityFromWorkspace("evidence", entity.id)}
                  title={`Remove "${entity.name}" from saved evidence`}
                  className="shrink-0 rounded px-1.5 py-0.5 text-xs text-zinc-600 hover:text-amber-400"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-zinc-600">
            No evidence saved yet. Bookmark evidence from any research topic to see it here.
          </p>
          <Link
            href="/research"
            className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
          >
            Explore Research Topics →
          </Link>
        </div>
      )}
    </section>
  );
}
