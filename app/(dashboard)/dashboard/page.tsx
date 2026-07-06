import PageHeader from "@/components/layout/PageHeader";
import PlatformStatusCard from "@/components/dashboard/PlatformStatusCard";
import RuntimeActivityFeed from "@/components/dashboard/RuntimeActivityFeed";
import RuntimeMetricsGrid from "@/components/dashboard/RuntimeMetricsGrid";
import SystemSummaryCard from "@/components/dashboard/SystemSummaryCard";
import SessionRegistrySummaryCard from "@/components/legacy-integration/SessionRegistrySummaryCard";
import { collectRuntimeDashboardData } from "@/lib/intelligence/dashboard";
import { collectLegacyBuildIntegrationModel } from "@/lib/legacy-build-integration";

export default function DashboardPage() {
  const data = collectRuntimeDashboardData();
  const integration = collectLegacyBuildIntegrationModel(data.collectedAt);

  return (
    <div className="space-y-8">
      <PageHeader
        title="System Monitor"
        description="Live CBAI Enterprise runtime and observability state from BUILD-058 foundations."
      />

      <PlatformStatusCard
        platform={data.platform}
        collectedAt={data.collectedAt}
      />

      <SessionRegistrySummaryCard summary={integration.sessionRegistry} />

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
