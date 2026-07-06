import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { PLATFORM_PERSONAS } from "@/lib/platform-home";

export default function HomePersonas() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {PLATFORM_PERSONAS.map((persona) => (
        <Link
          key={persona.id}
          href={persona.href}
          className="group block h-full rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          <Card className="h-full transition-colors group-hover:border-zinc-700">
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <h3 className="text-base font-semibold text-zinc-100">
                {persona.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-300">
                {persona.sentence}
              </p>
              <p className="text-sm font-medium text-sky-400 group-hover:text-sky-300">
                {persona.primaryAction} →
              </p>
              <div className="mt-auto space-y-3 border-t border-zinc-800 pt-4 text-xs">
                <div>
                  <p className="font-medium uppercase tracking-wider text-zinc-600">
                    Supported modules
                  </p>
                  <p className="mt-1 text-zinc-400">
                    {persona.supportedModules.join(" · ")}
                  </p>
                </div>
                <div>
                  <p className="font-medium uppercase tracking-wider text-zinc-600">
                    Available today
                  </p>
                  <p className="mt-1 leading-relaxed text-zinc-500">
                    {persona.currentCapability}
                  </p>
                </div>
                <div>
                  <p className="font-medium uppercase tracking-wider text-zinc-600">
                    Planned expansion
                  </p>
                  <p className="mt-1 leading-relaxed text-zinc-600">
                    {persona.futureCapability}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
