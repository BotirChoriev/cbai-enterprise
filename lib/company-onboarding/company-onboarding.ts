import type { OrganizationKind } from "@/lib/organization-os/organization.types";

export type CompanyOnboardingInput = {
  readonly statement: string;
  readonly name: string;
  readonly kind: OrganizationKind;
  readonly missionStatement: string;
  readonly website: string;
};

export type CompanyOnboardingDraft = {
  readonly input: CompanyOnboardingInput;
  readonly suggestedKind: OrganizationKind;
  readonly suggestedSpaces: readonly string[];
  readonly unknowns: readonly string[];
  readonly assumptions: readonly string[];
  readonly readyForHumanConfirmation: boolean;
};

const KIND_SIGNALS: readonly {
  readonly kind: OrganizationKind;
  readonly signals: readonly string[];
}[] = [
  { kind: "independent_laboratory", signals: ["laboratory", "lab", "laboratoriya", "лаборатория"] },
  { kind: "research_center", signals: ["research center", "tadqiqot markazi", "исследовательский центр"] },
  { kind: "university", signals: ["university", "universitet", "университет"] },
  { kind: "hospital", signals: ["hospital", "clinic", "shifoxona", "klinika", "больница", "клиника"] },
  { kind: "government", signals: ["government", "ministry", "davlat", "vazirlik", "правительство", "министерство"] },
  { kind: "ngo", signals: ["ngo", "nonprofit", "nodavlat", "нко"] },
  { kind: "startup", signals: ["startup", "startap", "стартап"] },
  { kind: "company", signals: ["company", "business", "kompaniya", "biznes", "компания", "бизнес"] },
];

const SPACES_BY_KIND: Readonly<Record<OrganizationKind, readonly string[]>> = {
  company: ["Operating problems", "Evidence and risk", "Scenario comparison", "Human decision log"],
  startup: ["Product assumptions", "Market evidence", "Runway scenarios", "Founder decision log"],
  university: ["Research programs", "Evidence library", "Scientific deliberation", "Academic decision log"],
  research_center: ["Research missions", "Methods and evidence", "Contradictions", "Review decisions"],
  independent_laboratory: ["Laboratory intake", "Methods and instruments", "Evidence validation", "Human review"],
  hospital: ["Clinical operations", "Safety evidence", "Risk review", "Authorized clinical decision"],
  government: ["Public problem space", "Policy evidence", "Impact scenarios", "Accountable decision log"],
  ngo: ["Mission outcomes", "Field evidence", "Stakeholder risks", "Governance decisions"],
  other: ["Shared problems", "Evidence space", "Scenario comparison", "Human decision log"],
};

export function suggestOrganizationKind(statement: string, fallback: OrganizationKind): OrganizationKind {
  const normalized = statement.trim().toLocaleLowerCase();
  if (!normalized) return fallback;
  const tokens = normalized.split(/[^\p{L}\p{N}_-]+/u).filter(Boolean);
  return KIND_SIGNALS.find(({ signals }) =>
    signals.some((signal) =>
      signal.includes(" ")
        ? normalized.includes(signal)
        : tokens.some((token) => token === signal || token.startsWith(signal)),
    ),
  )?.kind ?? fallback;
}

export function buildCompanyOnboardingDraft(input: CompanyOnboardingInput): CompanyOnboardingDraft {
  const name = input.name.trim();
  const missionStatement = input.missionStatement.trim();
  const website = input.website.trim();
  const statement = input.statement.trim();
  const suggestedKind = suggestOrganizationKind(`${statement} ${missionStatement}`, input.kind);
  const unknowns: string[] = [];
  const assumptions: string[] = [];

  if (!name) unknowns.push("organization_name");
  if (!missionStatement) unknowns.push("operating_purpose");
  if (!statement) unknowns.push("operating_context");
  if (!website) unknowns.push("official_website_optional");
  if (suggestedKind !== input.kind) assumptions.push(`organization_kind:${suggestedKind}`);

  return {
    input: {
      statement,
      name,
      kind: input.kind,
      missionStatement,
      website,
    },
    suggestedKind,
    suggestedSpaces: SPACES_BY_KIND[suggestedKind],
    unknowns,
    assumptions,
    readyForHumanConfirmation: Boolean(name && missionStatement),
  };
}

export function confirmCompanyOnboardingDraft(
  draft: CompanyOnboardingDraft,
  humanConfirmed: boolean,
): CompanyOnboardingInput | null {
  if (!humanConfirmed || !draft.readyForHumanConfirmation) return null;
  return {
    ...draft.input,
    kind: draft.suggestedKind,
  };
}
