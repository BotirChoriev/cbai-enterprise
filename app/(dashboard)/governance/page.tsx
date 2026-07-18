import type { Metadata } from "next";
import GovernancePageClient from "@/components/governance-control/GovernancePageClient";

export const metadata: Metadata = {
  title: "Governance",
  description: "Platform rules, standards, and review process for evidence-based decisions.",
};

/** Canonical Governance Control Center route — same UI as legacy /ai-control. */
export default function GovernancePage() {
  return <GovernancePageClient />;
}
