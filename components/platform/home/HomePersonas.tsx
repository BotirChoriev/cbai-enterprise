import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import type { PlatformPersona } from "@/lib/platform-home";
import { PLATFORM_PERSONAS } from "@/lib/platform-home";

type HomePersonasProps = {
  title?: string;
  description?: string;
  showLinks?: boolean;
};

function PersonaCard({
  persona,
  showLinks,
}: {
  persona: PlatformPersona;
  showLinks: boolean;
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col">
        <h3 className="text-sm font-semibold text-zinc-100">{persona.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
          {persona.value}
        </p>
        {showLinks ? (
          <Link
            href={persona.href}
            className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-sky-400 transition-colors hover:text-sky-300"
          >
            {persona.entryLabel} →
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function HomePersonas({ showLinks = false }: HomePersonasProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {PLATFORM_PERSONAS.map((persona) => (
        <PersonaCard key={persona.id} persona={persona} showLinks={showLinks} />
      ))}
    </div>
  );
}

export function HomePersonasSection({
  id,
  title,
  description,
  showLinks = false,
}: HomePersonasProps & { id: string }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-6 space-y-5"
    >
      <div className="space-y-1">
        <h2
          id={`${id}-heading`}
          className="text-lg font-semibold tracking-tight text-zinc-50"
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      <HomePersonas showLinks={showLinks} />
    </section>
  );
}
