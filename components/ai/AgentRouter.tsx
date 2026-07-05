import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const agents = [
  {
    name: "Research Agent",
    description: "Country analysis, market research, competitive intelligence",
    status: "idle" as const,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    ),
  },
  {
    name: "Strategy Agent",
    description: "Business planning, scenario modeling, strategic recommendations",
    status: "idle" as const,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    ),
  },
  {
    name: "Knowledge Agent",
    description: "Document summarization, RAG queries, knowledge retrieval",
    status: "ready" as const,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    ),
  },
  {
    name: "Automation Agent",
    description: "Workflow creation, task orchestration, process automation",
    status: "idle" as const,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
      />
    ),
  },
];

const statusStyles = {
  idle: {
    dot: "bg-zinc-600",
    label: "Idle",
    text: "text-zinc-500",
  },
  ready: {
    dot: "bg-emerald-400",
    label: "Ready",
    text: "text-emerald-400",
  },
  active: {
    dot: "bg-sky-400 animate-pulse",
    label: "Active",
    text: "text-sky-400",
  },
};

export default function AgentRouter() {
  return (
    <Card>
      <CardHeader
        title="Agent Routing"
        description="Commands are automatically routed to specialized agents"
      />
      <CardContent className="space-y-3">
        {agents.map((agent) => {
          const status = statusStyles[agent.status];
          return (
            <div
              key={agent.name}
              className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 transition-colors hover:border-zinc-700"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sky-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {agent.icon}
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200">
                    {agent.name}
                  </p>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                    />
                    <span className={`text-[10px] font-medium ${status.text}`}>
                      {status.label}
                    </span>
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  {agent.description}
                </p>
              </div>
            </div>
          );
        })}

        <div className="rounded-lg border border-dashed border-zinc-800 px-3 py-2.5 text-center">
          <p className="text-[10px] text-zinc-600">
            Intelligent routing selects the best agent for each command
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
