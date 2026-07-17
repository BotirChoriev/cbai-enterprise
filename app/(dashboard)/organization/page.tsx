import type { Metadata } from "next";
import OrganizationPageClient from "@/components/organization/OrganizationPageClient";

export const metadata: Metadata = {
  title: "Organization",
  description: "Organization workspace — membership, missions, and evidence context.",
};

export default function OrganizationPage() {
  return <OrganizationPageClient />;
}
