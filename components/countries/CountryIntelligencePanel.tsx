import type {
  CountryIntelligenceBlock,
  CountryIntelligenceProfile,
} from "@/lib/countries.intelligence";
import { countryEvidenceStatusClass } from "@/lib/countries.intelligence";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type CountryIntelligenceBlockCardProps = {
  block: CountryIntelligenceBlock;
};

export default function CountryIntelligenceBlockCard({
  block,
}: CountryIntelligenceBlockCardProps) {
  return (
    <Card>
      <CardHeader title={block.title} description={block.meaning} />
      <CardContent className="space-y-3">
        <p className="font-mono text-sm text-zinc-200">{block.displayValue}</p>
        <dl className="grid gap-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Evidence status</dt>
            <dd>
              <span
                className={`rounded-md border px-2 py-0.5 font-medium uppercase tracking-wider ${countryEvidenceStatusClass(block.evidenceStatus)}`}
              >
                {block.evidenceStatus.replace("_", " ")}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Confidence</dt>
            <dd className="text-right text-zinc-300">{block.confidenceStatus}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Source connected</dt>
            <dd className="text-zinc-300">{block.sourceConnected ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

type CountryIntelligencePanelProps = {
  profile: CountryIntelligenceProfile;
  countryName: string;
  countryCode: string;
  capital: string;
  region: string;
  government: string;
};

export function CountryIntelligencePanel({
  profile,
  countryName,
  countryCode,
  capital,
  region,
  government,
}: CountryIntelligencePanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
          Country Registry Profile
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          {countryName}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {countryCode} · {capital} · {region}
        </p>
        <p className="mt-3 text-sm text-zinc-400">Government form: {government}</p>
      </div>

      <Card>
        <CardHeader
          title="Political Neutrality Notice"
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
            <CountryIntelligenceBlockCard key={block.id} block={block} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Persona Intelligence
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {profile.personas.map((persona) => (
            <Card key={persona.id}>
              <CardHeader title={persona.title} />
              <CardContent className="space-y-3">
                <p className="text-sm text-zinc-300">{persona.guidance}</p>
                <p className="text-xs text-zinc-500">{persona.evidenceNote}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
