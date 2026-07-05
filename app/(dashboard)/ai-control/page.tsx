import PageHeader from "@/components/layout/PageHeader";
import CommandBox from "@/components/ai/CommandBox";
import AgentRouter from "@/components/ai/AgentRouter";
import SystemContext from "@/components/ai/SystemContext";

export default function AIControlPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Control Center"
        description="Command the platform — route tasks to agents, query knowledge, and orchestrate workflows."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CommandBox />
        </div>
        <div className="space-y-6">
          <AgentRouter />
          <SystemContext />
        </div>
      </div>
    </div>
  );
}
