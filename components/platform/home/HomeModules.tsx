import Link from "next/link";
import NavIcon from "@/components/layout/NavIcon";
import StatusBadge from "@/components/platform/home/StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { HOME_MODULES } from "@/lib/platform-home";

export default function HomeModules() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {HOME_MODULES.map((module) => (
        <Link key={module.id} href={module.href} className="group block">
          <Card className="h-full transition-colors group-hover:border-zinc-700">
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
                    <NavIcon name={module.icon} />
                  </div>
                  <h3 className="font-medium text-zinc-100">{module.label}</h3>
                </div>
                <StatusBadge status={module.status} />
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">
                {module.todayDescription}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
