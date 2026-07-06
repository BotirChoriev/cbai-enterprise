import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import NavIcon from "@/components/layout/NavIcon";
import PlatformRuntimeStatus from "@/components/platform/PlatformRuntimeStatus";
import { Card, CardContent } from "@/components/ui/Card";
import { platformModules } from "@/lib/navigation";

export default function PlatformHomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="CBAI Enterprise Platform"
        description="Select a module to explore intelligence, entities, discovery, and runtime operations."
      />

      <PlatformRuntimeStatus />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Platform Modules
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {platformModules.map((module) => (
            <Link key={module.href} href={module.href} className="group block">
              <Card className="h-full transition-colors group-hover:border-zinc-700">
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sky-400">
                      <NavIcon name={module.icon} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-100">{module.label}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
