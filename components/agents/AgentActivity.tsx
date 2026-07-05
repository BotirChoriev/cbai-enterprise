import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { AgentActivityItem } from "@/lib/agents";

const statusStyles = {
  success: "bg-emerald-500/10 text-emerald-400",
  running: "bg-sky-500/10 text-sky-400",
  failed: "bg-red-500/10 text-red-400",
};

type AgentActivityProps = {
  items: AgentActivityItem[];
};

export default function AgentActivity({ items }: AgentActivityProps) {
  return (
    <Card>
      <CardHeader
        title="Recent Agent Activity"
        description="Latest tasks and events across all agents"
      />
      <CardContent className="px-0 py-0">
        <ul className="divide-y divide-zinc-800">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-900/50"
            >
              <span
                className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusStyles[item.status]}`}
              >
                {item.status}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-300">
                  <span className="font-medium text-zinc-100">
                    {item.agentName}
                  </span>
                  {" — "}
                  {item.action}
                </p>
                <p className="truncate text-xs text-zinc-500">{item.detail}</p>
              </div>
              <span className="shrink-0 text-[10px] text-zinc-600">
                {item.time}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
