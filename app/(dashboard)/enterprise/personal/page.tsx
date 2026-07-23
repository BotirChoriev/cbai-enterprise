import type { Metadata } from "next";
import PersonalDashboard from "@/components/enterprise-collaboration/PersonalDashboard";

export const metadata: Metadata = {
  title: "Personal Dashboard",
  description: "Your organizations, approvals, reviews, and notifications.",
};

export default function PersonalDashboardPage() {
  return <PersonalDashboard />;
}
