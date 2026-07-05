const stats = [
  { value: "500+", label: "Enterprise Clients", sub: "Across 40 countries" },
  { value: "99.99%", label: "Platform Uptime", sub: "Guaranteed SLA" },
  { value: "10B+", label: "AI Inferences", sub: "Processed monthly" },
  { value: "<200ms", label: "Median Latency", sub: "Global edge network" },
];

export default function Stats() {
  return (
    <section id="enterprise" className="border-y border-zinc-800 bg-zinc-900/30 px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-300">
                {stat.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
