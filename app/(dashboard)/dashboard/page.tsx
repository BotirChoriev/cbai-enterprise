import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const recentActivity = [
  {
    id: 1,
    action: "Agent deployed",
    target: "Customer Support Bot v2.1",
    time: "2 minutes ago",
    type: "agent",
  },
  {
    id: 2,
    action: "Workflow completed",
    target: "Invoice Processing Pipeline",
    time: "14 minutes ago",
    type: "workflow",
  },
  {
    id: 3,
    action: "Document indexed",
    target: "Q4 Financial Report.pdf",
    time: "32 minutes ago",
    type: "knowledge",
  },
  {
    id: 4,
    action: "Token threshold alert",
    target: "847K tokens used (84.7%)",
    time: "1 hour ago",
    type: "alert",
  },
  {
    id: 5,
    action: "Agent updated",
    target: "Sales Intelligence Agent",
    time: "2 hours ago",
    type: "agent",
  },
];

const activityColors: Record<string, string> = {
  agent: "bg-sky-500/10 text-sky-400",
  workflow: "bg-violet-500/10 text-violet-400",
  knowledge: "bg-emerald-500/10 text-emerald-400",
  alert: "bg-amber-500/10 text-amber-400",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your AI platform activity and system health."
      />

      {/* AI System Status */}
      <Card>
        <CardHeader
          title="AI System Status"
          description="All systems operational"
        />
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-medium text-zinc-200">
                Platform Online
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="text-sm text-zinc-400">
              Gateway latency:{" "}
              <span className="font-medium text-zinc-200">142ms</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="text-sm text-zinc-400">
              Model providers:{" "}
              <span className="font-medium text-emerald-400">3/3 healthy</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="text-sm text-zinc-400">
              Last incident:{" "}
              <span className="font-medium text-zinc-200">None (47 days)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Running Agents"
          value={24}
          change="↑ 3 from yesterday"
          changeType="positive"
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          }
        />
        <StatCard
          label="Active Workflows"
          value={12}
          change="2 pending approval"
          changeType="neutral"
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
              />
            </svg>
          }
        />
        <StatCard
          label="Documents Indexed"
          value="14,832"
          change="↑ 247 this week"
          changeType="positive"
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          }
        />
        <StatCard
          label="AI Usage"
          value="847K"
          change="84.7% of monthly quota"
          changeType="neutral"
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Token Usage Graph placeholder */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Token Usage"
            description="Last 30 days"
            action={
              <select className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 outline-none">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 24 hours</option>
              </select>
            }
          />
          <CardContent>
            <div className="flex h-64 items-end justify-between gap-2 px-2">
              {[42, 58, 45, 72, 65, 80, 55, 90, 78, 85, 62, 95, 70, 88, 75, 92, 68, 82, 76, 98, 84, 71, 86, 79, 93, 87, 74, 91, 83, 89].map(
                (height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-sky-600/40 to-sky-400/80 transition-all hover:from-sky-500/60 hover:to-sky-300"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <span>Mar 5</span>
              <span className="font-medium text-zinc-300">
                Total: 847,293 tokens
              </span>
              <span>Apr 3</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Activity" description="Latest platform events" />
          <CardContent className="px-0 py-0">
            <ul className="divide-y divide-zinc-800">
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-900/50"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${activityColors[item.type]}`}
                  >
                    {item.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-300">
                      <span className="font-medium text-zinc-100">
                        {item.action}
                      </span>
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {item.target}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-zinc-600">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
