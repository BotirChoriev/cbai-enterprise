import type {
  UniversityIntelligenceBlock,
  UniversityIntelligenceProfile,
  UniversityTrustPillar,
} from "@/lib/universities.intelligence";
import { universityEvidenceStatusClass } from "@/lib/universities.intelligence";
import { formatWebsiteDisplay } from "@/lib/universities.adapter";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type UniversityIntelligenceBlockCardProps = {
  block: UniversityIntelligenceBlock;
};

function UniversityIntelligenceBlockCard({
  block,
}: UniversityIntelligenceBlockCardProps) {
  return (
    <Card>
      <CardHeader title={block.title} description={block.meaning} />
      <CardContent className="space-y-3">
        <p className="text-sm text-zinc-200">{block.displayValue}</p>
        <dl className="grid gap-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Evidence status</dt>
            <dd>
              <span
                className={`rounded-md border px-2 py-0.5 font-medium uppercase tracking-wider ${universityEvidenceStatusClass(block.evidenceStatus)}`}
              >
                {block.evidenceStatus.replace("_", " ")}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Available information</dt>
            <dd className="text-right text-zinc-300">{block.detail}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function UniversityTrustCard({ pillar }: { pillar: UniversityTrustPillar }) {
  return (
    <Card>
      <CardHeader title={pillar.title} />
      <CardContent>
        <p className="text-sm text-zinc-400">{pillar.description}</p>
      </CardContent>
    </Card>
  );
}

type UniversityIntelligencePanelProps = {
  profile: UniversityIntelligenceProfile;
  name: string;
  icon: string;
  country: string;
  city: string;
  type: string;
  founded: number;
  website: string | null;
};

export function UniversityIntelligencePanel({
  profile,
  name,
  icon,
  country,
  city,
  type,
  founded,
  website,
}: UniversityIntelligencePanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-violet-400">
          University Registry Profile
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          {name}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {icon} · {type} · {city}, {country}
        </p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Founded Year
            </dt>
            <dd className="text-zinc-300">{founded}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Official Website
            </dt>
            <dd className="text-zinc-300">
              {website ? (
                <a
                  href={website}
                  className="text-violet-400 underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {website}
                </a>
              ) : (
                formatWebsiteDisplay(website)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Registry Status
            </dt>
            <dd className="text-zinc-300">Local reference profile</dd>
          </div>
        </dl>
      </div>

      <Card>
        <CardHeader
          title="Institutional Neutrality Notice"
          description="CBAI Constitution compliance"
        />
        <CardContent>
          <p className="text-sm text-zinc-400">{profile.neutralityNotice}</p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Intelligence Blocks
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {profile.blocks.map((block) => (
            <UniversityIntelligenceBlockCard key={block.id} block={block} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Persona Views
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {profile.personas.map((persona) => (
            <Card key={persona.id}>
              <CardHeader title={persona.title} />
              <CardContent className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    Current Value
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">{persona.currentValue}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    Future Capability
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{persona.futureCapability}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="university-trust-heading">
        <h3
          id="university-trust-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Trust
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {profile.trustPillars.map((pillar) => (
            <UniversityTrustCard key={pillar.id} pillar={pillar} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default UniversityIntelligencePanel;
