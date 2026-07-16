import type { Metadata } from "next";
import InvestorPageClient from "@/components/workspaces/InvestorPageClient";

export const metadata: Metadata = {
  title: "Investor",
  description: "Investment evidence readiness by domain.",
};

export default function InvestorPage() {
  return <InvestorPageClient />;
}
