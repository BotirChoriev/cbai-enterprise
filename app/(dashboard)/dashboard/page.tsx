import type { Metadata } from "next";
import DashboardPageClient from "@/components/dashboard/DashboardPageClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "What is available today and what you can do now.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
