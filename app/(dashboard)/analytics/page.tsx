import type { Metadata } from "next";
import ReportsCenter from "@/components/reports/ReportsCenter";

export const metadata: Metadata = {
  title: "Reports",
  description: "Available report types by profile scope.",
};

export default function AnalyticsPage() {
  return <ReportsCenter />;
}
