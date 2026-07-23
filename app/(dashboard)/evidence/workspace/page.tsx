import type { Metadata } from "next";
import EvidenceWorkspacePageClient from "@/components/evidence/EvidenceWorkspacePageClient";

export const metadata: Metadata = {
  title: "Evidence workspace",
  description: "Device-local evidence lifecycle workspace — no fabricated live data.",
};

export default function EvidenceWorkspacePage() {
  return <EvidenceWorkspacePageClient />;
}
