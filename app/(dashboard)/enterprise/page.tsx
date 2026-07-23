import type { Metadata } from "next";
import EnterpriseHub from "@/components/enterprise-collaboration/EnterpriseHub";

export const metadata: Metadata = {
  title: "Enterprise Collaboration",
  description: "Personal, organization, workspace, and mission collaboration centers.",
};

export default function EnterprisePage() {
  return <EnterpriseHub />;
}
