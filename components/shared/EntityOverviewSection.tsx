import EntityProfileSection from "@/components/shared/EntityProfileSection";

export type EntityOverviewFacts = {
  label: string;
  value: string;
};

type EntityOverviewSectionProps = {
  name: string;
  entityType: string;
  country: string | null;
  subtitle?: string;
  availableInformation: string;
  facts?: readonly EntityOverviewFacts[];
};

export default function EntityOverviewSection({
  name,
  entityType,
  country,
  subtitle,
  availableInformation,
  facts = [],
}: EntityOverviewSectionProps) {
  return (
    <EntityProfileSection
      id="overview"
      title="Overview"
      nextStep={{ label: "Evidence →", href: "#evidence" }}
    >
      <div className="rounded-lg bg-zinc-900/50 px-4 py-4 sm:px-5">
        <h2 className="text-xl font-semibold text-zinc-50 sm:text-2xl">{name}</h2>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-600">Type</dt>
            <dd className="mt-0.5 text-zinc-300">{entityType}</dd>
          </div>
          {country ? (
            <div>
              <dt className="text-xs text-zinc-600">Country</dt>
              <dd className="mt-0.5 text-zinc-300">{country}</dd>
            </div>
          ) : null}
          <div className={country ? "sm:col-span-2" : ""}>
            <dt className="text-xs text-zinc-600">Available information</dt>
            <dd className="mt-0.5 text-zinc-300">{availableInformation}</dd>
          </div>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-zinc-600">{fact.label}</dt>
              <dd className="mt-0.5 text-zinc-300">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-cyan-400/90">
          Next: review evidence below.
        </p>
      </div>
    </EntityProfileSection>
  );
}
