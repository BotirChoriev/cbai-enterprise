import type { Metadata } from "next";
import ActivityCenter from "@/components/enterprise-collaboration/ActivityCenter";

export const metadata: Metadata = {
  title: "Activity Center",
  description: "Membership-scoped organization and collaboration audit events.",
};

export default function ActivityPage() {
  return <ActivityCenter />;
}
