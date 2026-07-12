import type { Metadata } from "next";
import GovernmentWorkspace from "@/components/workspaces/GovernmentWorkspace";

export const metadata: Metadata = {
  title: "Government",
  description: "Governance evidence coverage for public institutions.",
};

export default function GovernmentPage() {
  return <GovernmentWorkspace />;
}
