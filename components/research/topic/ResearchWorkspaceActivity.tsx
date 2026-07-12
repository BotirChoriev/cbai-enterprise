"use client";

import { useState } from "react";
import {
  loadResearchNotes,
  loadResearchFindings,
  loadEvidenceLifecycle,
  EVIDENCE_LIFECYCLE_LABELS,
} from "@/lib/research/research-workspace-store";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type WorkspaceActivityPanelProps = {
  topicId: string;
};

type ActivityEntry = {
  id: string;
  description: string;
  at: string;
};

function buildActivity(topicId: string): ActivityEntry[] {
  const notes = loadResearchNotes(topicId).map(
    (note): ActivityEntry => ({ id: `note-${note.noteId}`, description: "Note added", at: note.createdAt }),
  );
  const findings = loadResearchFindings(topicId).map(
    (finding): ActivityEntry => ({ id: `finding-${finding.findingId}`, description: "Finding recorded", at: finding.createdAt }),
  );
  const lifecycle = Object.values(loadEvidenceLifecycle(topicId)).map(
    (record): ActivityEntry => ({
      id: `lifecycle-${record.evidenceId}`,
      description: `Evidence marked ${EVIDENCE_LIFECYCLE_LABELS[record.stage]}`,
      at: record.updatedAt,
    }),
  );

  return [...notes, ...findings, ...lifecycle].sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Real Workspace Activity — a chronological feed built entirely from the user's own real actions
 * (notes, findings, evidence lifecycle changes), each with a real timestamp. Never a fabricated
 * "collaboration" or "team activity" feed — this platform has no multi-user session model.
 */
export default function ResearchWorkspaceActivity({ topicId }: WorkspaceActivityPanelProps) {
  const [activity] = useState(() => buildActivity(topicId));

  return (
    <section aria-labelledby="workspace-activity-heading" className={`${cbaiGlassCard} space-y-2 p-4`}>
      <p className={cbaiSectionEyebrow} id="workspace-activity-heading">
        Workspace Activity
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
        <p className="text-xs text-zinc-600">No workspace activity recorded yet.</p>
      )}
    </section>
  );
}
