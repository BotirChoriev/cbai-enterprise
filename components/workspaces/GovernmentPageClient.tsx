"use client";

import GovernmentWorkspace from "@/components/workspaces/GovernmentWorkspace";
import EcosystemWorkspacePage from "@/components/workspaces/EcosystemWorkspacePage";

export default function GovernmentPageClient() {
  return (
    <EcosystemWorkspacePage titleKey="navigation.government" previewKey="governancePreview">
      <GovernmentWorkspace />
    </EcosystemWorkspacePage>
  );
}
