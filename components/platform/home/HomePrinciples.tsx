import { Card, CardContent } from "@/components/ui/Card";
import { PLATFORM_PRINCIPLES } from "@/lib/platform-home";

export default function HomePrinciples() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PLATFORM_PRINCIPLES.map((principle) => (
        <Card key={principle.id}>
          <CardContent>
            <h3 className="text-sm font-semibold text-zinc-100">
              {principle.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              {principle.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
