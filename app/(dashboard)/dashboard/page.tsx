import PageHeader from "@/components/layout/PageHeader";
import ProductDashboard from "@/components/dashboard/ProductDashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="What is available today and what you can do now on CBAI."
      />
      <ProductDashboard />
    </div>
  );
}
