import type { Metadata } from "next";
import GovernanceControlCenter from "@/components/governance-control/GovernanceControlCenter";

export const metadata: Metadata = {
  title: "Governance",
  description: "Platform rules, standards, and review process for evidence-based decisions.",
};

export default function AIControlPage() {
  return <GovernanceControlCenter />;
}
