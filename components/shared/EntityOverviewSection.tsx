import EntityProfileSection from "@/components/shared/EntityProfileSection";
import { plainAvailableInformation } from "@/components/shared/entity-profile-copy";
import ShareButton from "@/components/shared/ShareButton";

export type EntityOverviewFacts = {
  label: string;
  value: string;
  /** Real external link, e.g. an official website — rendered as a real <a>, never a bare label. */
  href?: string;
};

type EntityOverviewSectionProps = {
  name: string;
  entityType: string;
  country: string | null;
  region?: string | null;
  subtitle?: string;
  availableInformation: string;
  facts?: readonly EntityOverviewFacts[];
};

export default function EntityOverviewSection({
  name,
  entityType,
  country,
  region = null,
  subtitle,
  availableInformation,
  facts = [],
}: EntityOverviewSectionProps) {
  return (
    <EntityProfileSection
      id="overview"
      title="Overview"
      nextStep={{ label: "Available information →", href: "#evidence" }}
    >
      <div className="rounded-lg bg-zinc-900/50 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-zinc-50 sm:text-2xl">{name}</h2>
            {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
          </div>
          <ShareButton className="shrink-0" />
        </div>
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
          {region ? (
            <div>
              <dt className="text-xs text-zinc-600">Region</dt>
              <dd className="mt-0.5 text-zinc-300">{region}</dd>
            </div>
          ) : null}
          <div className={country || region ? "sm:col-span-2" : ""}>
            <dt className="text-xs text-zinc-600">Available information</dt>
            <dd className="mt-0.5 text-zinc-300">{plainAvailableInformation(availableInformation)}</dd>
          </div>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-zinc-600">{fact.label}</dt>
              <dd className="mt-0.5 text-zinc-300">
                {fact.href ? (
                  <a
                    href={fact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline-offset-2 hover:underline"
                  >
                    {fact.value}
                  </a>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </EntityProfileSection>
  );
}
