export type ExecutionModule = {
  readonly moduleId: string;
  readonly title: string;
  readonly objective: string;
  readonly dependsOn: readonly string[];
  readonly status: "ready" | "blocked" | "completed";
  readonly humanConfirmationRequired: boolean;
  readonly verificationCriterion: string;
};

export type IntegrationRequirementProposal = {
  readonly integrationId: string;
  readonly label: string;
  readonly state: "mentioned_unverified";
  readonly nextAction: "verify_availability_and_request_consent";
};

export type ExecutionBlueprint = {
  readonly goal: string;
  readonly modules: readonly ExecutionModule[];
  readonly integrations: readonly IntegrationRequirementProposal[];
  readonly unresolvedInputs: readonly string[];
  readonly generatedFrom: "confirmed_agent_run";
  readonly generatedAt: string;
};

const INTEGRATION_CATALOG = [
  ["stripe", "Stripe"],
  ["shopify", "Shopify"],
  ["square", "Square"],
  ["doordash", "DoorDash"],
  ["uber eats", "Uber Eats"],
  ["google workspace", "Google Workspace"],
  ["microsoft 365", "Microsoft 365"],
  ["slack", "Slack"],
  ["quickbooks", "QuickBooks"],
  ["aws", "AWS"],
  ["azure", "Azure"],
  ["openai", "OpenAI"],
  ["github", "GitHub"],
  ["postgresql", "PostgreSQL"],
  ["firebase", "Firebase"],
  ["supabase", "Supabase"],
] as const;

function slug(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "module";
}

/** Converts confirmed process steps into a dependency graph; it never invents a vendor integration. */
export function generateExecutionBlueprint(input: {
  readonly goal: string;
  readonly processItems: readonly string[];
  readonly originalRequest: string;
  readonly unresolvedInputs: readonly string[];
  readonly generatedAt?: string;
}): ExecutionBlueprint {
  const usedIds = new Set<string>();
  const modules = input.processItems.map((title, index): ExecutionModule => {
    const base = slug(title);
    let moduleId = base;
    let suffix = 2;
    while (usedIds.has(moduleId)) moduleId = `${base}-${suffix++}`;
    usedIds.add(moduleId);
    const previous = index > 0 ? [...usedIds][index - 1] : null;
    return {
      moduleId,
      title,
      objective: `Produce a reviewable result for: ${title}`,
      dependsOn: previous ? [previous] : [],
      status: index === 0 ? "ready" : "blocked",
      humanConfirmationRequired: true,
      verificationCriterion: `A human confirms the ${title} output against stated requirements and evidence.`,
    };
  });

  const normalizedRequest = input.originalRequest.toLowerCase();
  const integrations = INTEGRATION_CATALOG
    .filter(([signal]) => normalizedRequest.includes(signal))
    .map(([integrationId, label]) => ({
      integrationId,
      label,
      state: "mentioned_unverified" as const,
      nextAction: "verify_availability_and_request_consent" as const,
    }));

  return {
    goal: input.goal,
    modules,
    integrations,
    unresolvedInputs: [...input.unresolvedInputs],
    generatedFrom: "confirmed_agent_run",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
