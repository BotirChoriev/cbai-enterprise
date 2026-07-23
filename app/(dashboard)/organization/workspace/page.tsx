import type { Metadata } from "next";
import OrganizationWorkspace from "@/components/enterprise-collaboration/OrganizationWorkspace";

export const metadata: Metadata = {
  title: "Organization Workspace",
  description:
    "Members, comments, mentions, approvals, and organization activity on Preview Supabase (RLS).",
};

export default function OrganizationWorkspacePage() {
  return <OrganizationWorkspace />;
}
