import type { Metadata } from "next";
import MissionDashboard from "@/components/enterprise-collaboration/MissionDashboard";

export const metadata: Metadata = {
  title: "Mission Dashboard",
  description: "Mission collaborations, assignees, and organization-scoped comments.",
};

export default function MissionDashboardPage() {
  return <MissionDashboard />;
}
