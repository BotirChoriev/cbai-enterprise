import PageHeader from "@/components/layout/PageHeader";
import ProductDashboard from "@/components/dashboard/ProductDashboard";

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
