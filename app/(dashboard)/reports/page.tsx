import type { Metadata } from "next";
import ReportsCenter from "@/components/reports/ReportsCenter";

// Real alias for /analytics — the canonical "Reports" route, matching the primary navigation
// label (lib/navigation.ts) and the /reports path this mission's own browser-verification
// checklist names. /analytics is preserved unchanged (existing links/routes are never removed);
// this route renders the exact same real ReportsCenter, not a second implementation.
export const metadata: Metadata = {
  title: "Reports",
  description: "Available report types by profile scope.",
};

export default function ReportsPage() {
  return <ReportsCenter />;
}
