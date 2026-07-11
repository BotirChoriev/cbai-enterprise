import StatCard from "@/components/ui/StatCard";
import { getAgentStats, agents, AGENT_RUNTIME_NOT_CONNECTED_LABEL } from "@/lib/agents";

const stats = getAgentStats(agents);

export default function AgentStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        label="Agent Capabilities Defined"
        value={stats.totalAgents}
        change="Described below — none execute live tasks yet"
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
        label="Runtime Status"
        value={AGENT_RUNTIME_NOT_CONNECTED_LABEL}
        change="No live agent execution is connected to this platform"
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
              d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
            />
          </svg>
        }
      />
    </div>
  );
}
