import type {
  CompanyIntelligenceBlock,
  CompanyIntelligenceProfile,
} from "@/lib/companies.intelligence";
import { companyEvidenceStatusClass } from "@/lib/companies.intelligence";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type CompanyIntelligenceBlockCardProps = {
  block: CompanyIntelligenceBlock;
};

function CompanyIntelligenceBlockCard({
  block,
}: CompanyIntelligenceBlockCardProps) {
  return (
    <Card>
      <CardHeader title={block.title} description={block.meaning} />
      <CardContent className="space-y-3">
        <p className="text-sm text-zinc-200">{block.displayValue}</p>
        <dl className="grid gap-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Status</dt>
            <dd>
              <span
                className={`rounded-md border px-2 py-0.5 font-medium uppercase tracking-wider ${companyEvidenceStatusClass(block.evidenceStatus)}`}
              >
                {block.evidenceStatus.replace("_", " ")}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Detail</dt>
            <dd className="text-right text-zinc-300">{block.detail}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

type CompanyIntelligencePanelProps = {
  profile: CompanyIntelligenceProfile;
  name: string;
  icon: string;
  country: string;
  industry: string;
  founded: number;
};

export function CompanyIntelligencePanel({
  profile,
  name,
  icon,
  country,
  industry,
  founded,
}: CompanyIntelligencePanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-sky-400">
          Company Registry Profile
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          {name}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {icon} · {industry} · {country}
        </p>
        <p className="mt-3 text-sm text-zinc-400">Founded {founded}</p>
      </div>

      <Card>
        <CardHeader
          title="Political and Commercial Neutrality Notice"
          description="CBAI Constitution compliance"
        />
        <CardContent>
          <p className="text-sm text-zinc-400">{profile.neutralityNotice}</p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Intelligence Sections
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {profile.blocks.map((block) => (
            <CompanyIntelligenceBlockCard key={block.id} block={block} />
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

export default CompanyIntelligencePanel;
