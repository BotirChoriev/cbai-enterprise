import PageHeader from "@/components/layout/PageHeader";
import PlatformStatusCard from "@/components/dashboard/PlatformStatusCard";
import RuntimeActivityFeed from "@/components/dashboard/RuntimeActivityFeed";
import RuntimeMetricsGrid from "@/components/dashboard/RuntimeMetricsGrid";
import SystemSummaryCard from "@/components/dashboard/SystemSummaryCard";
import { collectRuntimeDashboardData } from "@/lib/intelligence/dashboard";

export default function DashboardPage() {
  const data = collectRuntimeDashboardData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Live CBAI Enterprise runtime and observability state."
      />

      <PlatformStatusCard
        platform={data.platform}
        collectedAt={data.collectedAt}
      />

      <RuntimeMetricsGrid
        runtime={data.runtime}
        queue={data.queue}
        scheduler={data.scheduler}
        agents={data.agents}
        worker={data.worker}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <SystemSummaryCard
          summary={data.systemSummary}
          hasActivity={data.hasActivity}
          harnessVersion={data.harness.harnessVersion}
        />
        <RuntimeActivityFeed activities={data.activities} />
      </div>
    </div>
  );
}
