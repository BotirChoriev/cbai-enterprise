/**
 * Knowledge Gap Exchange — matches structured unknowns to capability kinds.
 * Does not invent researchers/grants; returns honest empty matches when registries lack data.
 */

export type GapCapabilityKind =
  | "researcher"
  | "student"
  | "university"
  | "laboratory"
  | "method"
  | "grant"
  | "investor"
  | "institution";

export type KnowledgeGap = {
  readonly id: string;
  readonly statement: string;
  readonly domain: string | null;
  readonly contentLocale: string;
  readonly desiredCapabilityKinds: readonly GapCapabilityKind[];
};

export type GapMatch = {
  readonly gapId: string;
  readonly capabilityKind: GapCapabilityKind;
  readonly candidateLabel: string | null;
  readonly candidateHref: string | null;
  readonly status: "matched_local" | "no_local_match" | "external_blocked";
  readonly detail: string;
};

export type KnowledgeGapExchangeResult = {
  readonly gap: KnowledgeGap;
  readonly matches: readonly GapMatch[];
  readonly honestyNotice: string;
};

const CAPABILITY_ROUTES: Record<GapCapabilityKind, string> = {
  researcher: "/universities",
  student: "/universities",
  university: "/universities",
  laboratory: "/research",
  method: "/evidence",
  grant: "/research",
  investor: "/investor",
  institution: "/government",
};

export function matchKnowledgeGap(gap: KnowledgeGap): KnowledgeGapExchangeResult {
  const statement = gap.statement.trim();
  if (!statement) {
    throw new Error("gap_statement_required");
  }

  const matches: GapMatch[] = gap.desiredCapabilityKinds.map((kind) => ({
    gapId: gap.id,
    capabilityKind: kind,
    candidateLabel: null,
    candidateHref: CAPABILITY_ROUTES[kind],
    status: kind === "grant" || kind === "investor" ? ("external_blocked" as const) : ("no_local_match" as const),
    detail:
      kind === "grant" || kind === "investor"
        ? "Live external opportunity feeds are not connected — browse declared routes only."
        : "No verified local candidate registry hit for this gap yet. Open the related workspace to request evidence or collaboration.",
  }));

  return {
    gap,
    matches,
    honestyNotice:
      "Knowledge Gap Exchange structures unresolved problems. It does not invent collaborators, grants, or people.",
  };
}

export function gapFromUnknowns(input: {
  readonly unknowns: readonly string[];
  readonly locale: string;
  readonly domain?: string | null;
}): KnowledgeGap | null {
  const first = input.unknowns.map((u) => u.trim()).find(Boolean);
  if (!first) return null;
  return {
    id: `gap-${Date.now().toString(36)}`,
    statement: first,
    domain: input.domain ?? null,
    contentLocale: input.locale,
    desiredCapabilityKinds: ["researcher", "university", "laboratory", "method", "grant"],
  };
}
