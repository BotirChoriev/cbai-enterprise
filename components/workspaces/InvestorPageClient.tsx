"use client";

import InvestorWorkspace from "@/components/workspaces/InvestorWorkspace";
import EcosystemWorkspacePage from "@/components/workspaces/EcosystemWorkspacePage";

export default function InvestorPageClient() {
  return (
    <EcosystemWorkspacePage titleKey="navigation.investor" previewKey="investorPreview">
      <InvestorWorkspace />
    </EcosystemWorkspacePage>
  );
}
