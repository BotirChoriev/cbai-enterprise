/**
 * Role discovery and command-to-workspace draft flow.
 *
 * Detect → interpret → confirm → create. Nothing is persisted until the user
 * confirms. Confirmed work uses Operational Object drafts (never a parallel store).
 */

import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";
import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";
import {
  detectRoleIntent,
  getWorkspaceTemplate,
  type DetectedRoleIntent,
  type WorkspacePrivacy,
  type WorkspaceTemplateId,
} from "@/lib/adaptive-workspace/templates";

export type RoleInterpretation = {
  readonly understoodRole: WorkspaceRole;
  readonly goal: string;
  readonly domain: string;
  readonly suggestedTemplateId: WorkspaceTemplateId;
  readonly missingInformation: readonly string[];
  readonly confidence: DetectedRoleIntent["confidence"];
  readonly originalText: string;
  readonly privacy: WorkspacePrivacy;
  readonly inferredFields: readonly string[];
};

export type WorkspaceCreationDraft = {
  readonly interpretation: RoleInterpretation;
  readonly proposedWorkspaceName: string;
  readonly proposedProjectName: string;
  readonly country: string | null;
  readonly topic: string | null;
  readonly objective: string;
  readonly suggestedIndicators: readonly string[];
  readonly suggestedOfficialSources: readonly string[];
  readonly timeRange: string | null;
  readonly missingDetails: readonly string[];
  readonly privacy: WorkspacePrivacy;
  readonly firstThreeActions: readonly string[];
  readonly operationalObjectDraft: OperationalObjectDraft;
  readonly status: "awaiting_confirmation";
};

function extractCountry(text: string): string | null {
  if (/o['‘`]?zbekiston|uzbekistan|узбекистан/i.test(text)) return "Uzbekistan";
  if (/\busa\b|united states|америка/i.test(text)) return "United States";
  if (/china|xitoy|китай/i.test(text)) return "China";
  if (/germany|germaniya|германия/i.test(text)) return "Germany";
  if (/japan|yaponiya|япония/i.test(text)) return "Japan";
  if (/uae|emirates|bba/i.test(text)) return "United Arab Emirates";
  return null;
}

function extractTopic(text: string): string | null {
  if (/inflat|inflyats/i.test(text)) return "inflation";
  if (/trade|savdo|торговля/i.test(text)) return "trade";
  if (/education|ta['‘`]?lim|образован/i.test(text)) return "education";
  if (/health|sog['‘`]?liq|здоров/i.test(text)) return "health";
  if (/research|tadqiqot|исследован/i.test(text)) return "research";
  return null;
}

/** Build a transparent interpretation — never persists. */
export function interpretRoleStatement(input: {
  readonly text: string;
  readonly locale: string;
}): RoleInterpretation {
  const detected = detectRoleIntent(input.text);
  const country = extractCountry(input.text);
  const topic = extractTopic(input.text);
  const goal =
    input.text.trim() ||
    (input.locale === "uz" ? "Hali aniqlanmagan maqsad" : "Goal not yet specified");
  const domain = [country, topic].filter(Boolean).join(" · ") || "";
  const missing = [...detected.missingFollowUps];
  if (!country && detected.role === "economist") missing.unshift("geography");
  if (!topic) missing.unshift("topic");

  return {
    understoodRole: detected.role,
    goal,
    domain: domain || (input.locale === "uz" ? "Hali aniqlanmagan soha" : "Domain not yet specified"),
    suggestedTemplateId: detected.templateId,
    missingInformation: Array.from(new Set(missing)).slice(0, 3),
    confidence: detected.confidence,
    originalText: input.text,
    privacy: "private",
    inferredFields: [
      "understoodRole",
      "suggestedTemplateId",
      ...(country ? (["country"] as const) : []),
      ...(topic ? (["topic"] as const) : []),
    ],
  };
}

/** Turn a confirmed interpretation into an OO draft card — still not saved. */
export function buildWorkspaceCreationDraft(input: {
  readonly interpretation: RoleInterpretation;
  readonly locale: string;
  readonly edits?: Partial<{
    workspaceName: string;
    projectName: string;
    objective: string;
    privacy: WorkspacePrivacy;
    country: string | null;
    topic: string | null;
  }>;
}): WorkspaceCreationDraft {
  const template = getWorkspaceTemplate(input.interpretation.suggestedTemplateId);
  const country = input.edits?.country ?? extractCountry(input.interpretation.originalText);
  const topic = input.edits?.topic ?? extractTopic(input.interpretation.originalText);
  const roleLabel = input.interpretation.understoodRole;
  const proposedWorkspaceName =
    input.edits?.workspaceName ??
    `${roleLabel.replace(/_/g, " ")} workspace${country ? ` — ${country}` : ""}`;
  const proposedProjectName =
    input.edits?.projectName ??
    (topic && country ? `${country} ${topic}` : input.interpretation.goal.slice(0, 80));
  const objective = input.edits?.objective ?? input.interpretation.goal;
  const privacy = input.edits?.privacy ?? "private";

  const suggestedIndicators =
    template.id === "economist" && topic === "inflation"
      ? ["Consumer price index (official)", "Food price index (if published)"]
      : [];
  const suggestedOfficialSources =
    country === "Uzbekistan"
      ? ["Official statistics office (when connected)", "Central bank publications (when connected)"]
      : ["Official national statistics (when connected)"];

  const firstThreeActions = [
    "Confirm and create the workspace",
    "Attach required evidence sources",
    "Set the first next action",
  ];

  const operationalObjectDraft: OperationalObjectDraft = {
    type: template.operationalObjectType,
    title: proposedProjectName,
    summary: objective,
    objective,
    rationale: `Template: ${template.id}. Role: ${roleLabel}. Privacy default: ${privacy}.`,
    expectedOutcome: "A confirmed personal workspace with an explicit next action.",
    domain: template.domain,
    status: "draft",
    priority: "normal",
    requiredInputs: template.fields.filter((field) => field.required).map((field) => field.id),
    evidenceRequirements: suggestedOfficialSources,
    nextAction: firstThreeActions[2]!,
    humanDecision: "Confirm before creation. Human remains decision owner.",
    knownInformation: [
      `role:${roleLabel}`,
      ...(country ? [`country:${country}`] : []),
      ...(topic ? [`topic:${topic}`] : []),
    ],
    missingInformation: input.interpretation.missingInformation,
    assumptions: template.fields
      .filter((field) => field.inferredByDefault)
      .map((field) => `inferred:${field.id}`),
    humanApprovalRequired: true,
    relatedObjectIds: [],
    locale: input.locale,
    provenance: {
      source: "voice_command",
      originalText: input.interpretation.originalText,
      locale: input.locale,
      inferredFields: input.interpretation.inferredFields,
      relatedEntityKind: country ? "country" : undefined,
      relatedEntityName: country ?? undefined,
    },
  };

  return {
    interpretation: { ...input.interpretation, privacy },
    proposedWorkspaceName,
    proposedProjectName,
    country,
    topic,
    objective,
    suggestedIndicators,
    suggestedOfficialSources,
    timeRange: null,
    missingDetails: input.interpretation.missingInformation,
    privacy,
    firstThreeActions,
    operationalObjectDraft,
    status: "awaiting_confirmation",
  };
}

/** Mapping documentation helper for architecture docs and tests. */
export const ADAPTIVE_WORKSPACE_MAPPINGS = {
  userProfile: "AssistantProfile.workspaceRole + confirmed objective fields",
  workspace: "OperationalObject (work_plan | research_question | project | decision_brief)",
  projects: "lib/project via My Work after confirmation",
  missions: "optional Mission link — never auto-created",
  evidence: "evidenceRequirements on OO + Evidence routes",
  meetings: "Live Intelligence Rooms / meeting OO types",
  groups: "collaboration models — private by default",
  media: "PDF/local intake — no silent public publish",
  followedItems: "Global Updates watches — opted-in only",
} as const;
