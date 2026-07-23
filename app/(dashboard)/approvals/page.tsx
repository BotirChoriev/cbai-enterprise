import type { Metadata } from "next";
import CloudAccountGate from "@/components/account/CloudAccountGate";
import ApprovalCenter from "@/components/enterprise-collaboration/ApprovalCenter";

export const metadata: Metadata = {
  title: "Approval Center",
  description: "Request and decide organization-scoped approvals.",
};

export default function ApprovalsPage() {
  return (
    <CloudAccountGate>
      <ApprovalCenter />
    </CloudAccountGate>
  );
}
