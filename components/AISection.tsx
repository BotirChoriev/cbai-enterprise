const capabilities = [
  "Multi-model routing with automatic failover",
  "Custom fine-tuning and prompt versioning",
  "Enterprise-grade data residency controls",
  "End-to-end encryption at rest and in transit",
];

export default function AISection() {
  return (
    <section id="ai" className="px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-sky-400">
              AI Capabilities
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              Production-ready AI, governed by design
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400">
              Route requests across leading LLM providers through a single
              secure gateway. CBAI handles observability, cost controls, and
              compliance so your teams focus on outcomes — not infrastructure.
            </p>

            <ul className="mt-8 space-y-3">
              {capabilities.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="#"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-sky-400 transition-colors hover:text-sky-300"
            >
              Explore AI documentation
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-600/5 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="border-b border-zinc-800 px-4 py-3">
                <p className="font-mono text-xs text-zinc-500">
                  cbai-gateway / inference
                </p>
              </div>
              <div className="space-y-4 p-6 font-mono text-xs leading-relaxed">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                  <p className="text-zinc-500">
                    <span className="text-sky-400">POST</span> /v1/chat/completions
                  </p>
                  <p className="mt-2 text-zinc-400">
                    {"{"}
                    <br />
                    {"  "}
                    <span className="text-zinc-300">&quot;model&quot;</span>:{" "}
                    <span className="text-emerald-400">&quot;cbai-enterprise-v2&quot;</span>,
                    <br />
                    {"  "}
                    <span className="text-zinc-300">&quot;tenant&quot;</span>:{" "}
                    <span className="text-emerald-400">&quot;acme-corp&quot;</span>,
                    <br />
                    {"  "}
                    <span className="text-zinc-300">&quot;stream&quot;</span>:{" "}
                    <span className="text-amber-400">true</span>
                    <br />
                    {"}"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-zinc-400">
                      Routing to primary provider...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-zinc-400">
                      PII scan passed · latency 134ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
                    <span className="text-zinc-300">
                      Streaming response to client...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
