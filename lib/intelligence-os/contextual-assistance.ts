export type ContextualEngineId = "algorithm" | "cybernetics" | "ai";

export type ContextualDomain =
  | "research"
  | "engineering"
  | "agriculture"
  | "business"
  | "general";

export type ContextualAssistance = {
  readonly domain: ContextualDomain;
  readonly intent: string;
  readonly signals: readonly string[];
  readonly evidenceGaps: readonly string[];
  readonly options: readonly string[];
  readonly suggestedEngines: readonly ContextualEngineId[];
};

const DOMAIN_PATTERNS: ReadonlyArray<{
  readonly domain: ContextualDomain;
  readonly pattern: RegExp;
}> = [
  {
    domain: "research",
    pattern:
      /\b(phd|thesis|dissertation|research|experiment|laboratory|lab|biology|molecule|molecular|chemistry|methodology|ilmiy|tadqiqot|tajriba|laboratoriya|biologiya|molekula)\b/i,
  },
  {
    domain: "engineering",
    pattern:
      /\b(engineer|mechanic|motor|bridge|construction|architecture|drone|diagnostic|muhandis|mexanik|dvigatel|ko['’]?prik|qurilish|arxitekt)\b/i,
  },
  {
    domain: "agriculture",
    pattern:
      /(agronom|agriculture|plant|crop|soil|disease|o['‘’]?simlik|ekin|tuproq|kasallik)/i,
  },
  {
    domain: "business",
    pattern:
      /\b(company|business|market|customer|operations|strategy|kompaniya|biznes|bozor|mijoz|strategiya)\b/i,
  },
];

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function inferContextualDomain(input: string): ContextualDomain {
  const normalized = clean(input);
  return DOMAIN_PATTERNS.find((candidate) => candidate.pattern.test(normalized))?.domain ?? "general";
}

function intentFor(domain: ContextualDomain): string {
  switch (domain) {
    case "research":
      return "Clarify the research objective before interpreting the material";
    case "engineering":
      return "Define the fault, constraints, and acceptable outcome";
    case "agriculture":
      return "Identify the observed condition and the decision that must be made";
    case "business":
      return "Define the operating objective, constraints, and decision owner";
    default:
      return "Clarify what outcome matters and what decision is required";
  }
}

function domainSignals(domain: ContextualDomain, hasMaterial: boolean): readonly string[] {
  const materialSignal = hasMaterial
    ? "Material is attached but not yet interpreted"
    : "No supporting material is attached yet";
  switch (domain) {
    case "research":
      return [materialSignal, "Research method and result claims require separation"];
    case "engineering":
      return [materialSignal, "Observed behavior must be separated from suspected cause"];
    case "agriculture":
      return [materialSignal, "Visible symptoms need environmental and time context"];
    case "business":
      return [materialSignal, "Operating signals need an owner and time window"];
    default:
      return [materialSignal, "The current situation still needs structured context"];
  }
}

function domainGaps(domain: ContextualDomain): readonly string[] {
  switch (domain) {
    case "research":
      return ["Human-confirmed objective", "Method, controls, units, and source provenance"];
    case "engineering":
      return ["Measurements and operating conditions", "Safety constraints and diagnostic history"];
    case "agriculture":
      return ["Location, crop stage, and recent conditions", "Laboratory or field confirmation"];
    case "business":
      return ["Decision owner and success measure", "Verified internal and external evidence"];
    default:
      return ["Human-confirmed objective", "Verified evidence and important constraints"];
  }
}

function domainOptions(domain: ContextualDomain): readonly string[] {
  switch (domain) {
    case "research":
      return ["Review the method", "Compare repeat-experiment paths"];
    case "engineering":
      return ["Run a diagnostic sequence", "Compare repair or redesign paths"];
    case "agriculture":
      return ["Request field evidence", "Compare treatment and monitoring paths"];
    case "business":
      return ["Build operating scenarios", "Compare cost, risk, and reversibility"];
    default:
      return ["Structure the problem", "Collect evidence before comparing paths"];
  }
}

export function deriveContextualAssistance(input: {
  readonly text: string;
  readonly fileName?: string | null;
  readonly fileType?: string | null;
}): ContextualAssistance {
  const materialDescription = [input.text, input.fileName, input.fileType].filter(Boolean).join(" ");
  const domain = inferContextualDomain(materialDescription);
  const lower = materialDescription.toLowerCase();
  const hasMaterial = Boolean(input.fileName);
  const needsFeedback =
    hasMaterial ||
    /\b(monitor|measurement|result|change|feedback|sensor|device|experiment|o['‘’]?lchov|natija|kuzat|qurilma|tajriba)\b/i.test(
      lower,
    );

  return {
    domain,
    intent: intentFor(domain),
    signals: domainSignals(domain, hasMaterial),
    evidenceGaps: domainGaps(domain),
    options: domainOptions(domain),
    suggestedEngines: needsFeedback
      ? ["algorithm", "cybernetics", "ai"]
      : ["algorithm", "ai"],
  };
}
