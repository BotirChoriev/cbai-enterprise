import PageHeader from "@/components/layout/PageHeader";
import AgentStats from "@/components/agents/AgentStats";
import AgentCard from "@/components/agents/AgentCard";
import AgentActivity from "@/components/agents/AgentActivity";
import { agents, agentActivity } from "@/lib/agents";

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Agents"
        description="Deploy, manage, and monitor autonomous AI agents."
        action={
          <button
            type="button"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400"
          >
            Create Agent
          </button>
        }
      />

      <AgentStats />

      <div>
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">
          Deployed Agents
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      <AgentActivity items={agentActivity} />
    </div>
  );
}
