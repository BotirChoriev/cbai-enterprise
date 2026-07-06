import Link from "next/link";
import HomeModuleIcon from "@/components/platform/home/HomeModuleIcon";
import { Card, CardContent } from "@/components/ui/Card";
import { HOME_MODULES } from "@/lib/platform-home";

export default function HomeModules() {
  const availableModules = HOME_MODULES.filter((module) => module.status === "available");

  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {availableModules.map((module) => (
        <Link
          key={module.id}
          href={module.href}
          className="group block h-full rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          <Card className="h-full transition-colors group-hover:border-zinc-700">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
                  <HomeModuleIcon name={module.icon} />
                </div>
                <h3 className="text-base font-semibold text-zinc-100">{module.label}</h3>
              </div>
              <p className="text-sm leading-relaxed text-zinc-400">{module.currentCapability}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
