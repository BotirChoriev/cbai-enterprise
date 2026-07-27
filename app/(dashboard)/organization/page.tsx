import type { Metadata } from "next";
import OrganizationPageClient from "@/components/organization/OrganizationPageClient";
import DecisionJourneyHero from "@/components/experience/DecisionJourneyHero";

export const metadata: Metadata = {
  title: "Organization",
  description: "Organization workspace — membership, missions, and evidence context.",
};

export default function OrganizationPage() {
  return (
    <div className="mx-auto max-w-[100rem] space-y-6">
      <DecisionJourneyHero variant="collaboration" />
      <OrganizationPageClient />
    </div>
  );
}
