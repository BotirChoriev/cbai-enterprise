import type { Metadata } from "next";
import CloudAccountGate from "@/components/account/CloudAccountGate";
import WorkspaceDashboard from "@/components/enterprise-collaboration/WorkspaceDashboard";

export const metadata: Metadata = {
  title: "Workspace Dashboard",
  description: "Product workspace lenses and active organization context.",
};

export default function WorkspaceDashboardPage() {
  return (
    <CloudAccountGate>
      <WorkspaceDashboard />
    </CloudAccountGate>
  );
}
