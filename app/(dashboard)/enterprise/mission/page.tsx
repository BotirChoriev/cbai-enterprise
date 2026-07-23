import type { Metadata } from "next";
import CloudAccountGate from "@/components/account/CloudAccountGate";
import MissionDashboard from "@/components/enterprise-collaboration/MissionDashboard";

export const metadata: Metadata = {
  title: "Mission Dashboard",
  description: "Mission collaborations, assignees, and organization-scoped comments.",
};

export default function MissionDashboardPage() {
  return (
    <CloudAccountGate>
      <MissionDashboard />
    </CloudAccountGate>
  );
}
