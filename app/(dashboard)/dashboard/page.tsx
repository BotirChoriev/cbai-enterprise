import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import ProductDashboard from "@/components/dashboard/ProductDashboard";
import HomeEcosystems from "@/components/platform/home/HomeEcosystems";
import HomeCapabilityFlow from "@/components/platform/home/HomeCapabilityFlow";
import HomeAudience from "@/components/platform/home/HomeAudience";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "What is available today and what you can do now.",
};

// Ecosystems, Capability Flow, and Audience moved here from the home page (Platform Completion
// mission, Phase 7 — the first screen is now scoped to exactly 8 operational sections). Real
// content, unchanged, just relocated to the page whose stated purpose — "what is available today"
// — is the honest home for platform-explanation material, rather than deleted.
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Public Intelligence — what is available today on CBAI."
      />
      <ProductDashboard />
      <HomeEcosystems />
      <HomeCapabilityFlow />
      <HomeAudience />
    </div>
  );
}
