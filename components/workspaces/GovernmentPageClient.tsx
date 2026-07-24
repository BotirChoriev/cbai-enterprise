"use client";

import GovernmentWorkspace from "@/components/workspaces/GovernmentWorkspace";
import EcosystemWorkspacePage from "@/components/workspaces/EcosystemWorkspacePage";
import EngineRouteEntryStrip from "@/components/forward-deployed/EngineRouteEntryStrip";

export default function GovernmentPageClient() {
  return (
    <EcosystemWorkspacePage titleKey="navigation.government" previewKey="governancePreview">
      <EngineRouteEntryStrip />
      <GovernmentWorkspace />
    </EcosystemWorkspacePage>
  );
}
