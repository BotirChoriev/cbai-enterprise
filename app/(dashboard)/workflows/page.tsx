import type { Metadata } from "next";
import PreviewInDevelopmentPage from "@/components/preview/PreviewInDevelopmentPage";

// Not in primary navigation (confirmed unreachable from any real nav link) — honestly a "coming
// soon" stub, excluded from search indexing so it never competes with real product surfaces.
export const metadata: Metadata = {
  title: "Workflows",
  description: "Workflow builder coming soon — not available yet.",
  robots: { index: false, follow: true },
};

export default function WorkflowsPage() {
  return <PreviewInDevelopmentPage variant="workflows" />;
}
