export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-sm text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Enterprise AI Platform — Now in Private Beta
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            Intelligent automation for{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              modern enterprises
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            CBAI Enterprise delivers secure, scalable AI infrastructure that
            transforms how your organization operates, decides, and innovates.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#"
              className="w-full rounded-lg bg-sky-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-400 sm:w-auto"
            >
              Start Free Trial
            </a>
            <a
              href="#"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-50 sm:w-auto"
            >
              Talk to Sales
            </a>
          </div>

          <p className="mt-6 text-xs text-zinc-500">
            SOC 2 Type II certified · GDPR compliant · 99.99% uptime SLA
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="ml-2 font-mono text-xs text-zinc-500">
                cbai-enterprise — dashboard
              </span>
            </div>
            <div className="grid gap-px bg-zinc-800 p-px sm:grid-cols-3">
              <div className="bg-zinc-950 p-6">
                <p className="font-mono text-xs text-zinc-500">Active Agents</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-50">247</p>
                <p className="mt-1 text-xs text-emerald-400">↑ 12% this week</p>
              </div>
              <div className="bg-zinc-950 p-6">
                <p className="font-mono text-xs text-zinc-500">Tasks Automated</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-50">18.4K</p>
                <p className="mt-1 text-xs text-emerald-400">↑ 8% this week</p>
              </div>
              <div className="bg-zinc-950 p-6">
                <p className="font-mono text-xs text-zinc-500">Avg. Response</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-50">142ms</p>
                <p className="mt-1 text-xs text-sky-400">Within SLA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
