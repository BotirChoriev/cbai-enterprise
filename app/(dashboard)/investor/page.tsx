import type { Metadata } from "next";
import InvestorWorkspace from "@/components/workspaces/InvestorWorkspace";

export const metadata: Metadata = {
  title: "Investor",
  description: "Investment evidence readiness by domain.",
};

export default function InvestorPage() {
  return <InvestorWorkspace />;
}
