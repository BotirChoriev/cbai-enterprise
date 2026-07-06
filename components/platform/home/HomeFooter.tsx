import {
  HOME_FOOTER,
  PLATFORM_EVOLUTION_PHASE,
  PLATFORM_VERSION,
} from "@/lib/platform-home";

export default function HomeFooter() {
  return (
    <footer className="rounded-2xl border border-zinc-800 bg-zinc-900/30 px-6 py-8 sm:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Mission
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            {HOME_FOOTER.mission}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Constitution
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {HOME_FOOTER.constitutionReference}
            </p>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Core principles
            </h2>
            <ul className="mt-1 space-y-1 text-sm text-zinc-400">
              {HOME_FOOTER.principles.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-zinc-600">
            <p>CBAI Enterprise · v{PLATFORM_VERSION}</p>
            <p>{PLATFORM_EVOLUTION_PHASE}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
