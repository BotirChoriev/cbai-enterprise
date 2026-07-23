"use client";

import ModeAwareWorkspace from "@/components/user-modes/ModeAwareWorkspace";
import OperatingPageShell from "@/components/shared/OperatingPageShell";

export default function ModesPageClient() {
  return (
    <OperatingPageShell
      title="User modes"
      description="Ten personal modes for default surfaces and assistant hints. Preference only — not organization RBAC."
      showMissionContext={false}
    >
      <ModeAwareWorkspace variant="full" />
    </OperatingPageShell>
  );
}
