"use client";

import EvidenceWorkspacePanel from "@/components/evidence/EvidenceWorkspacePanel";
import OperatingPageShell from "@/components/shared/OperatingPageShell";

export default function EvidenceWorkspacePageClient() {
  return (
    <OperatingPageShell
      title="Evidence workspace"
      description="Device-local evidence lifecycle and provenance. Unverified never displays as verified."
      missionContextVariant="compact"
    >
      <EvidenceWorkspacePanel />
    </OperatingPageShell>
  );
}
