import type { Metadata } from "next";
import GovernancePageClient from "@/components/governance-control/GovernancePageClient";

export const metadata: Metadata = {
  title: "Governance",
  description: "Platform rules, standards, and review process for evidence-based decisions.",
};

export default function AIControlPage() {
  return <GovernancePageClient />;
}
