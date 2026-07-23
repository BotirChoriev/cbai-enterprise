import type { Metadata } from "next";
import { Suspense } from "react";
import CloudAccountGate from "@/components/account/CloudAccountGate";
import OrganizationDashboard from "@/components/enterprise-collaboration/OrganizationDashboard";

export const metadata: Metadata = {
  title: "Organization Dashboard",
  description: "Organization roles, comments, and audit for members only.",
};

export default function OrganizationDashboardPage() {
  return (
    <CloudAccountGate>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading organization dashboard…</p>}>
        <OrganizationDashboard />
      </Suspense>
    </CloudAccountGate>
  );
}
