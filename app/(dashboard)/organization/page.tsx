import type { Metadata } from "next";
import { Suspense } from "react";
import CloudAccountGate from "@/components/account/CloudAccountGate";
import OrganizationPageClient from "@/components/organization/OrganizationPageClient";

export const metadata: Metadata = {
  title: "Organization",
  description: "Organization workspace — membership, missions, and evidence context.",
};

export default function OrganizationPage() {
  return (
    <CloudAccountGate>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading organization…</p>}>
        <OrganizationPageClient />
      </Suspense>
    </CloudAccountGate>
  );
}
