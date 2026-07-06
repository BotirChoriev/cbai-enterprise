import Link from "next/link";
import { platformModules } from "@/lib/navigation";

export default function CorePage() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">CBAI Core</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          Core inference and agent orchestration are not active in this deployment. Use the
          modules below for live registry intelligence.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {platformModules.map((module) => (
          <li key={module.href}>
            <Link
              href={module.href}
              className="block rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition-colors hover:border-cyan-500/30"
            >
              <p className="text-sm font-semibold text-zinc-200">{module.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{module.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
