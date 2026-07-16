import type { Metadata } from "next";
import GovernmentPageClient from "@/components/workspaces/GovernmentPageClient";

export const metadata: Metadata = {
  title: "Government",
  description: "Governance evidence coverage for public institutions.",
};

export default function GovernmentPage() {
  return <GovernmentPageClient />;
}
