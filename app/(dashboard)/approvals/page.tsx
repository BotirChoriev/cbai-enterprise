import type { Metadata } from "next";
import ApprovalCenter from "@/components/enterprise-collaboration/ApprovalCenter";

export const metadata: Metadata = {
  title: "Approval Center",
  description: "Request and decide organization-scoped approvals.",
};

export default function ApprovalsPage() {
  return <ApprovalCenter />;
}
