import Link from "next/link";
import HomeModuleIcon from "@/components/platform/home/HomeModuleIcon";
import StatusBadge from "@/components/platform/home/StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { HOME_MODULES } from "@/lib/platform-home";

export default function HomeModules() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {HOME_MODULES.map((module) => (
        <Link
          key={module.id}
          href={module.href}
          className="group block h-full rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          <Card className="h-full transition-colors group-hover:border-zinc-700">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
                    <HomeModuleIcon name={module.icon} />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    {module.label}
                  </h3>
                </div>
                <StatusBadge status={module.status} />
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                    Purpose
                  </dt>
                  <dd className="mt-1 leading-relaxed text-zinc-400">
                    {module.purpose}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                    Evidence status
                  </dt>
                  <dd className="mt-1 text-zinc-300">{module.evidenceStatus}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                    Available today
                  </dt>
                  <dd className="mt-1 leading-relaxed text-zinc-500">
                    {module.currentCapability}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                    Planned expansion
                  </dt>
                  <dd className="mt-1 leading-relaxed text-zinc-600">
                    {module.futureCapability}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                    Dependencies
                  </dt>
                  <dd className="mt-1 leading-relaxed text-zinc-600">
                    {module.dependencies}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
