"use client";

import { useMemo } from "react";
import {
  loadResearchNotes,
  loadResearchFindings,
  loadEvidenceLifecycle,
} from "@/lib/research/research-workspace-store";
import EmptyState from "@/components/shared/EmptyState";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionDataRevision } from "@/lib/hooks/use-mission-data-revision";
import { translateEvidenceLifecycleStage } from "@/lib/i18n/evidence-lifecycle-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type WorkspaceActivityPanelProps = {
  topicId: string;
};

type ActivityEntry = {
  id: string;
  description: string;
  at: string;
};

/**
 * Real Workspace Activity — chronological feed from the user's own actions only.
 */
export default function ResearchWorkspaceActivity({ topicId }: WorkspaceActivityPanelProps) {
  const { t } = useTranslation();
  const revision = useMissionDataRevision();

  const activity = useMemo(() => {
    const notes = loadResearchNotes(topicId).map(
      (note): ActivityEntry => ({
        id: `note-${note.noteId}`,
        description: t("evidenceLifecycle.activityNoteAdded"),
        at: note.createdAt,
      }),
    );
    const findings = loadResearchFindings(topicId).map(
      (finding): ActivityEntry => ({
        id: `finding-${finding.findingId}`,
        description: t("evidenceLifecycle.activityFindingRecorded"),
        at: finding.createdAt,
      }),
    );
    const lifecycle = Object.values(loadEvidenceLifecycle(topicId)).map(
      (record): ActivityEntry => ({
        id: `lifecycle-${record.evidenceId}`,
        description: t("evidenceLifecycle.activityMarked", {
          stage: translateEvidenceLifecycleStage(record.stage, t),
        }),
        at: record.updatedAt,
      }),
    );

    return [...notes, ...findings, ...lifecycle].sort((a, b) => b.at.localeCompare(a.at));
  }, [topicId, t, revision]);

  return (
    <section aria-labelledby="workspace-activity-heading" className={`${cbaiGlassCard} space-y-2 p-4`}>
      <p className={cbaiSectionEyebrow} id="workspace-activity-heading">
        {t("evidenceLifecycle.activityEyebrow")}
      </p>
      {activity.length > 0 ? (
        <ul className="space-y-1.5">
          {activity.map((entry) => (
            <li key={entry.id} className="flex items-start gap-2 text-xs text-zinc-500">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
              <span>
                {entry.description} — <span className="text-zinc-600">{new Date(entry.at).toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState variant="dashed" message={t("evidenceLifecycle.activityEmpty")} />
      )}
    </section>
  );
}
