import type { Metadata } from "next";
import CloudAccountGate from "@/components/account/CloudAccountGate";
import ActivityCenter from "@/components/enterprise-collaboration/ActivityCenter";

export const metadata: Metadata = {
  title: "Activity Center",
  description: "Membership-scoped organization and collaboration audit events.",
};

export default function ActivityPage() {
  return (
    <CloudAccountGate>
      <ActivityCenter />
    </CloudAccountGate>
  );
}
