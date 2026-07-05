import { missionControl } from "@/lib/core";

const metrics = [
  {
    label: "Global AI Status",
    value: missionControl.globalStatus,
    sub: "All systems nominal",
    accent: "text-emerald-400",
    glow: "shadow-emerald-500/10",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    ),
  },
  {
    label: "Active AI Model",
    value: missionControl.activeModel,
    sub: "Primary inference engine",
    accent: "text-sky-400",
    glow: "shadow-sky-500/10",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
      />
    ),
  },
  {
    label: "Running Agents",
    value: String(missionControl.runningAgents),
    sub: "2 idle · 1 paused",
    accent: "text-violet-400",
    glow: "shadow-violet-500/10",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      />
    ),
  },
  {
    label: "Connected Modules",
    value: String(missionControl.connectedModules),
    sub: "7/7 online",
    accent: "text-cyan-400",
    glow: "shadow-cyan-500/10",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    ),
  },
];

export default function MissionControl() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/5 via-violet-500/5 to-cyan-500/5"
      />
      <div className="relative grid gap-px sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`bg-zinc-950/80 p-5 shadow-lg ${metric.glow}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  {metric.label}
                </p>
                <p
                  className={`mt-2 font-mono text-lg font-semibold tracking-tight ${metric.accent}`}
                >
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-zinc-600">{metric.sub}</p>
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 ${metric.accent}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {metric.icon}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
