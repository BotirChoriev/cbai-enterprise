import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { SourceHealthItem } from "@/lib/knowledge";

const statusConfig = {
  healthy: {
    label: "Healthy",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-amber-400",
    text: "text-amber-400",
  },
  offline: {
    label: "Offline",
    dot: "bg-red-400",
    text: "text-red-400",
  },
};

type SourceHealthProps = {
  sources: SourceHealthItem[];
};

export default function SourceHealth({ sources }: SourceHealthProps) {
  const healthyCount = sources.filter((s) => s.status === "healthy").length;

  return (
    <Card>
      <CardHeader
        title="Source Health"
        description={`${healthyCount}/${sources.length} sources operational`}
      />
      <CardContent className="space-y-3">
        {sources.map((source) => {
          const status = statusConfig[source.status];
          return (
            <div
              key={source.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 transition-colors hover:border-zinc-700"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                {source.status === "healthy" && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status.dot}`}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200">
                    {source.name}
                  </p>
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wider ${status.text}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500">
                  <span>{source.type}</span>
                  <span className="text-zinc-700">·</span>
                  <span>{source.latency} latency</span>
                  <span className="text-zinc-700">·</span>
                  <span>Sync: {source.lastSync}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
