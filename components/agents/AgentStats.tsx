import StatCard from "@/components/ui/StatCard";
import { getAgentStats, agents } from "@/lib/agents";

const stats = getAgentStats(agents);

export default function AgentStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Agents"
        value={stats.totalAgents}
        change="6 specialized agents deployed"
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
              d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        }
      />
      <StatCard
        label="Active Agents"
        value={stats.activeAgents}
        change={`${stats.totalAgents - stats.activeAgents} idle or paused`}
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
              d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
            />
          </svg>
        }
      />
      <StatCard
        label="Tasks Completed"
        value={stats.tasksCompleted.toLocaleString()}
        change="↑ 342 this week"
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
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <StatCard
        label="Avg Success Rate"
        value={`${stats.avgSuccessRate}%`}
        change="Above 90% target"
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
              d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
            />
          </svg>
        }
      />
    </div>
  );
}
