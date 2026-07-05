import type { ModuleStatus, PlatformModule } from "@/lib/core";

const statusConfig: Record<
  ModuleStatus,
  { label: string; dot: string; text: string }
> = {
  online: {
    label: "Online",
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

type ModuleStatusProps = {
  modules: PlatformModule[];
};

export default function ModuleStatusPanel({ modules }: ModuleStatusProps) {
  const onlineCount = modules.filter((m) => m.status === "online").length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-zinc-50">
              Module Status
            </h2>
            <p className="text-xs text-zinc-500">Platform subsystem health</p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
            {onlineCount}/{modules.length} ONLINE
          </span>
        </div>
      </div>

      <div className="grid gap-px bg-zinc-800 p-px sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((mod) => {
          const status = statusConfig[mod.status];
          return (
            <div
              key={mod.id}
              className="flex items-center justify-between bg-zinc-950 px-4 py-3.5 transition-colors hover:bg-zinc-900/80"
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  {mod.status === "online" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  )}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${status.dot}`}
                  />
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  {mod.name}
                </span>
              </div>
              <div className="text-right">
                <p className={`text-[10px] font-medium ${status.text}`}>
                  {status.label}
                </p>
                <p className="font-mono text-[10px] text-zinc-600">
                  {mod.latency}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
