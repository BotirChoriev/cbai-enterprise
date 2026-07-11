import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import ProductDashboard from "@/components/dashboard/ProductDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "What is available today and what you can do now.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Public Intelligence — what is available today on CBAI."
      />
      <ProductDashboard />
    </div>
  );
}
