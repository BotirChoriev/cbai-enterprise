"use client";

import CitizenWorkspace from "@/components/workspaces/CitizenWorkspace";
import EcosystemWorkspacePage from "@/components/workspaces/EcosystemWorkspacePage";

export default function CitizenPageClient() {
  return (
    <EcosystemWorkspacePage titleKey="navigation.citizen" previewKey="citizenPreview">
      <CitizenWorkspace />
    </EcosystemWorkspacePage>
  );
}
