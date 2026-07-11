import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { RuntimeActivityItem } from "@/lib/intelligence/dashboard/types";

const activityColors: Record<
  RuntimeActivityItem["kind"],
  string
> = {
  session: "bg-sky-500/10 text-sky-400",
  task: "bg-violet-500/10 text-violet-400",
  queue: "bg-emerald-500/10 text-emerald-400",
  scheduler: "bg-amber-500/10 text-amber-400",
};

function formatActivityTimestamp(iso: string): string {
  return iso.replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

type RuntimeActivityFeedProps = {
  activities: readonly RuntimeActivityItem[];
};

export default function RuntimeActivityFeed({
  activities,
}: RuntimeActivityFeedProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Recent Activity"
        description="Latest session, task, queue, and scheduler events"
      />
      <CardContent className="px-0 py-0">
        {activities.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-1 px-5 text-center">
            <p className="text-sm text-zinc-500">No activity recorded yet</p>
            <p className="max-w-xs text-xs text-zinc-600">
              Session, task, queue, and scheduler events appear here once this runtime records
              real activity — not an error.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {activities.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-900/50"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${activityColors[item.kind]}`}
                >
                  {item.kind}
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
                  {formatActivityTimestamp(item.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
