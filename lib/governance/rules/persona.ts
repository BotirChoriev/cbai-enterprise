import type { PersonaRule } from "@/lib/governance/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

function definePersonaRule(
  input: Omit<PersonaRule, "category" | "version">,
): PersonaRule {
  return { ...input, category: "persona", version: GOVERNANCE_VERSION };
}

/** Persona governance rules — every module must address all six personas honestly. */
export const PERSONA_RULES: readonly PersonaRule[] = [
  definePersonaRule({
    id: "persona-citizen-value",
    slug: "citizen-value-required",
    personaId: "citizen",
    title: "Citizen Value Required",
    description:
      "Modules must explain what public evidence is available and what remains unconnected — without partisan framing.",
    severity: "major",
    allowed: [
      "Evidence category visibility for citizens",
      "Connection status per indicator",
    ],
    forbidden: [
      "Nationalist or fear-based citizen messaging",
      "Promised scores unavailable today",
    ],
    standardReference: "docs/standards/07-persona-standard.md",
  }),
  definePersonaRule({
    id: "persona-investor-value",
    slug: "investor-value-required",
    personaId: "investor",
    title: "Investor Value Required",
    description:
      "Modules must identify which due-diligence indicators require connection — not investment recommendations.",
    severity: "major",
    allowed: [
      "Honest due diligence scoping",
      "Indicator gaps for fiscal and procurement data",
    ],
    forbidden: [
      "Strong buy or investment recommendations",
      "Confidence percentages for investors",
    ],
    standardReference: "docs/standards/07-persona-standard.md",
  }),
  definePersonaRule({
    id: "persona-government-value",
    slug: "government-value-required",
    personaId: "government",
    title: "Government Value Required",
    description:
      "Modules must help governments prioritize data publication using methodology gaps — not political ratings.",
    severity: "major",
    allowed: [
      "Publication priority from evidence gaps",
      "Methodology references for officials",
    ],
    forbidden: [
      "Political advocacy for governments",
      "Comparative propaganda between nations",
    ],
    standardReference: "docs/standards/07-persona-standard.md",
  }),
  definePersonaRule({
    id: "persona-student-value",
    slug: "student-value-required",
    personaId: "student",
    title: "Student Value Required",
    description:
      "Modules must clarify which education indicators apply — without fake rankings or league tables.",
    severity: "major",
    allowed: [
      "Institution registry facts for students",
      "Honest indicator availability for programs",
    ],
    forbidden: [
      "Fake university rankings",
      "Promised employment outcomes without data",
    ],
    standardReference: "docs/standards/07-persona-standard.md",
  }),
  definePersonaRule({
    id: "persona-researcher-value",
    slug: "researcher-value-required",
    personaId: "researcher",
    title: "Researcher Value Required",
    description:
      "Modules must enable reproducible research scoping: definitions, sources, status export.",
    severity: "major",
    allowed: [
      "Indicator ID and source slug references",
      "Export-friendly registry metadata",
    ],
    forbidden: [
      "Undocumented scoring inputs",
      "Non-reproducible intelligence claims",
    ],
    standardReference: "docs/standards/07-persona-standard.md",
  }),
  definePersonaRule({
    id: "persona-academic-value",
    slug: "academic-value-required",
    personaId: "academic",
    title: "Academic Value Required",
    description:
      "Modules must support citable methodology and evidence requirements in scholarly work.",
    severity: "major",
    allowed: [
      "Methodology version references",
      "Separation of registry facts from evaluation",
    ],
    forbidden: [
      "Unattributed third-party indices as fact",
      "Scores without citable methodology",
    ],
    standardReference: "docs/standards/07-persona-standard.md",
  }),
  definePersonaRule({
    id: "persona-all-six-required",
    slug: "all-personas-required",
    personaId: "citizen",
    title: "All Six Personas Required",
    description:
      "Entity routes must include all six persona sections or an equivalent consolidated block.",
    severity: "critical",
    allowed: [
      "Dedicated persona block per route",
      "Consolidated persona grid with six entries",
    ],
    forbidden: [
      "Shipping entity routes with missing personas",
      "Persona-specific different evidence standards",
    ],
    standardReference: "docs/standards/07-persona-standard.md",
  }),
] as const;

export const REQUIRED_PERSONA_IDS: readonly PersonaRule["personaId"][] = [
  "citizen",
  "investor",
  "government",
  "student",
  "researcher",
  "academic",
] as const;

export function getPersonaRuleById(
  personaId: PersonaRule["personaId"],
): PersonaRule[] {
  return PERSONA_RULES.filter((rule) => rule.personaId === personaId);
}
