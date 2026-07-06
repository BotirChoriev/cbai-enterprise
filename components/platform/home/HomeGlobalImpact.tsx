import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { GLOBAL_IMPACT } from "@/lib/platform-home";

export default function HomeGlobalImpact() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {GLOBAL_IMPACT.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="group block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          <Card className="h-full transition-colors group-hover:border-zinc-700">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                {item.title}
              </h3>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Current value
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-200">
                  {item.currentValue}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Future roadmap
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {item.futureRoadmap}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
