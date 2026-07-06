import {
  HOME_FOOTER,
  PLATFORM_BUILD,
  PLATFORM_EVOLUTION_PHASE,
  PLATFORM_VERSION,
} from "@/lib/platform-home";

const footerColumns = [
  { title: "Constitution", body: HOME_FOOTER.constitution },
  { title: "Evidence Policy", body: HOME_FOOTER.evidencePolicy },
  { title: "Transparency", body: HOME_FOOTER.transparency },
  { title: "Methodology", body: HOME_FOOTER.methodology },
  { title: "Documentation", body: HOME_FOOTER.documentation },
] as const;

export default function HomeFooter() {
  return (
    <footer className="home-surface rounded-2xl border border-zinc-800 px-8 py-10 sm:px-10">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Mission
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-400">
            {HOME_FOOTER.mission}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {column.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {column.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-1 border-t border-zinc-800 pt-6 text-xs text-zinc-600 sm:flex-row sm:justify-between">
        <p>CBAI Evidence Intelligence Platform</p>
        <p>
          Version {PLATFORM_VERSION} · Build {PLATFORM_BUILD} · {PLATFORM_EVOLUTION_PHASE}
        </p>
      </div>
    </footer>
  );
}
