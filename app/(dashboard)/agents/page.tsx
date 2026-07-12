import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import AgentStats from "@/components/agents/AgentStats";
import AgentCard from "@/components/agents/AgentCard";
import AgentActivity from "@/components/agents/AgentActivity";
import { agents } from "@/lib/agents";

// Not in primary navigation (removed after self-disclosing as non-functional immediately after
// the click) — kept reachable by direct URL, excluded from search indexing.
export const metadata: Metadata = {
  title: "Agents",
  description: "Planned agent capabilities for this platform — not available yet.",
  robots: { index: false, follow: true },
};

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Agents"
        description="Planned agent capabilities for this platform — not available yet."
      />

      <AgentStats />

      <div>
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">
          Agent Capabilities
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      <AgentActivity />
    </div>
  );
}
