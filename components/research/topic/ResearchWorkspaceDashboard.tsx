"use client";

import { useState } from "react";
import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { buildResearchMission } from "@/lib/research-mission/research-mission-builder";
import { deriveResearchReadiness } from "@/lib/research/readiness/readiness-engine";
import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import { loadResearchNotes } from "@/lib/research/research-workspace-store";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { profileSectionHref } from "@/components/shared/entity-profile-path";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchWorkspaceDashboardProps = {
  topic: ResearchTopic;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${cbaiGlassCard} p-3`}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

/**
 * Research Dashboard — the single "at a glance" summary the mission asks for (Current Question,
 * Current Progress, Evidence Summary, Missing Evidence, Recent Notes, Open Tasks, Related
 * Reports, Workspace Status), composed entirely from already-real, already-computed sources:
 * buildResearchMission (question), deriveResearchReadiness (progress), deriveEvidenceGapIntelligence
 * (evidence summary + missing evidence), the real notes store (recent notes), and the real pin
 * architecture (workspace status). Nothing here is newly derived — this is a composition, not a
 * new engine.
 */
export default function ResearchWorkspaceDashboard({ topic }: ResearchWorkspaceDashboardProps) {
  const { isEntityPinned } = usePlatformContext();
  const [mission] = useState(() => buildResearchMission({ missionId: topic.topicId }));
  const [readiness] = useState(() => deriveResearchReadiness(topic.topicId));
  const [intelligence] = useState(() => deriveEvidenceGapIntelligence(topic.topicId));
  // Real hydration-mismatch fix (found via actual browser testing): unlike mission/readiness/
  // intelligence above (pure catalog computations, identical on server and client),
  // loadResearchNotes reads real localStorage — honestly empty server-side, so the conditional
  // <ul>/<p> swap below produced a real structural mismatch for any topic with saved notes.
  const hydrated = useHydrated();
  const recentNotes = hydrated ? loadResearchNotes(topic.topicId).slice(0, 3) : [];

  const question = mission.workspaceContract?.missionSummary.missionCenter.question.question ?? topic.description;
  const openTasksCount =
    (intelligence?.disconnectedEvidence.length ?? 0) +
    (intelligence?.reviewGatedEvidence.length ?? 0) +
    (intelligence?.reviewStatus.reviewOpened ? 0 : 1);
  const missingEvidenceCount = intelligence?.disconnectedEvidence.length ?? 0;
  const pinned = isEntityPinned("research_topic", topic.topicId);

  return (
    <section aria-labelledby="research-dashboard-heading" className={`${cbaiGlassCard} space-y-4 p-4 sm:p-5`}>
      <div>
        <p className={cbaiSectionEyebrow} id="research-dashboard-heading">
          Research Dashboard
        </p>
        <p className="mt-1 text-sm text-zinc-300">{question}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard
          label="Progress"
          value={readiness ? `${readiness.completedMilestones.length}/${readiness.completedMilestones.length + readiness.remainingMilestones.length} milestones` : "Unavailable"}
        />
        <StatCard
          label="Evidence connected"
          value={intelligence ? `${intelligence.connectedEvidence.length}` : "0"}
        />
        <StatCard label="Missing evidence" value={String(missingEvidenceCount)} />
        <StatCard label="Open tasks" value={String(openTasksCount)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">Recent notes</p>
          {recentNotes.length > 0 ? (
            <ul className="space-y-1">
              {recentNotes.map((note) => (
                <li key={note.noteId} className="text-xs text-zinc-500">
                  {note.body.length > 80 ? `${note.body.slice(0, 80)}…` : note.body}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-600">No notes recorded yet.</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">Related reports</p>
          <p className="text-xs text-zinc-500">
            <Link href={profileSectionHref(`/research/${topic.topicId}`, "generate-report")} className="text-teal-400 hover:underline">
              1 report type available →
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-800/80 pt-3">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">Workspace status</p>
        <p className="mt-1 text-xs text-zinc-400">
          {pinned ? "Saved to workspace" : "Not saved to workspace yet"}
        </p>
      </div>
    </section>
  );
}
