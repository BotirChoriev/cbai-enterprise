import { universities } from "@/lib/universities";
import { UNIT_REGISTRY } from "@/lib/research-canvas/unit-registry";
import {
  readScientistHumanContext,
  scientistInputFromHumanContext,
  writeScientistHumanContext,
} from "@/lib/human-centered-workspace/scientist-context-adapter";

const STORAGE_KEY = "cbai.scientist-workflow.v1";

export type ScientistWorkflowContext = {
  readonly role: "scientist";
  readonly universityId: string | null;
  readonly universityName: string | null;
  readonly unitId: string | null;
  readonly unitSymbol: string | null;
  readonly projectStatement: string | null;
  readonly smartIdeaId: string | null;
};

export type ScientistWorkflowResolution = {
  readonly handled: boolean;
  readonly href?: string;
  readonly message?: string;
  readonly context?: ScientistWorkflowContext;
};

const EMPTY_CONTEXT: ScientistWorkflowContext = {
  role: "scientist",
  universityId: null,
  universityName: null,
  unitId: null,
  unitSymbol: null,
  projectStatement: null,
  smartIdeaId: null,
};

function normalized(value: string): string {
  return value.toLocaleLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}°]+/gu, " ").trim();
}

function phrasePresent(text: string, phrase: string): boolean {
  const haystack = ` ${normalized(text)} `;
  const needle = ` ${normalized(phrase)} `;
  return needle.trim().length > 0 && haystack.includes(needle);
}

export function extractUniversity(text: string) {
  return universities.find((university) =>
    [university.name, university.id, ...(university.aliases ?? [])].some((candidate) => phrasePresent(text, candidate)),
  ) ?? null;
}

export function extractUnit(text: string) {
  const ordered = [...UNIT_REGISTRY].sort((a, b) =>
    Math.max(b.name.length, b.symbol.length, ...b.aliases.map((alias) => alias.length)) -
    Math.max(a.name.length, a.symbol.length, ...a.aliases.map((alias) => alias.length)),
  );
  return ordered.find((unit) => {
    const longNames = [unit.name, unit.symbol, unit.id, ...unit.aliases].filter((candidate) => normalized(candidate).length > 1);
    if (longNames.some((candidate) => phrasePresent(text, candidate))) return true;
    if (unit.symbol.length !== 1) return false;
    return new RegExp(`(^|[^\\p{L}\\p{N}])${unit.symbol.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}($|[^\\p{L}\\p{N}])`, "u").test(text);
  }) ?? null;
}

export function readScientistWorkflowContext(): ScientistWorkflowContext | null {
  if (typeof window === "undefined") return null;
  const humanContext = readScientistHumanContext();
  if (humanContext) {
    return {
      role: "scientist",
      ...scientistInputFromHumanContext(humanContext),
    };
  }
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null") as Partial<ScientistWorkflowContext> | null;
    if (!parsed || parsed.role !== "scientist") return null;
    const legacy = { ...EMPTY_CONTEXT, ...parsed };
    // Read-through migration: preserve the working legacy session value, then
    // promote it into the canonical namespaced Human Context repository.
    writeScientistHumanContext(legacy);
    return legacy;
  } catch {
    return null;
  }
}

export function writeScientistWorkflowContext(context: ScientistWorkflowContext): void {
  if (typeof window === "undefined") return;
  writeScientistHumanContext(context);
  // Temporary compatibility projection for already-open tabs. Human Context is
  // authoritative; this key can be retired after the compatibility window.
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
}

export function buildScientistWorkspaceHref(context: ScientistWorkflowContext): string {
  const params = new URLSearchParams({ scientist: "1", panel: "measure" });
  if (context.universityId) params.set("university", context.universityId);
  if (context.unitId) params.set("unit", context.unitId);
  if (context.smartIdeaId) params.set("smartIdea", context.smartIdeaId);
  return `/research/canvas?${params.toString()}`;
}

function nextMissingItem(context: ScientistWorkflowContext): string {
  if (!context.universityId) return "Which university is this project connected to?";
  if (!context.unitId) return "Which measurement unit are you using?";
  if (!context.smartIdeaId) return "Select or create the research project before recording measurements.";
  return "What measurement would you like to evaluate next?";
}

export function resolveScientistWorkflowTurn(
  text: string,
  previous: ScientistWorkflowContext | null,
): ScientistWorkflowResolution {
  const lower = normalized(text);
  const unsafeProof = /\b(proves?|proved|confirm(?:s|ed)?|establish(?:es|ed)?)\b.*\b(hypothesis|theory|claim)\b/.test(lower) ||
    /\b(hypothesis|theory|claim)\b.*\b(proves?|proved)\b/.test(lower);
  if (unsafeProof) {
    return {
      handled: true,
      context: previous ?? EMPTY_CONTEXT,
      message: "I cannot declare that the experiment proves the hypothesis without sufficient evidence. The evaluation still needs the study design, measurements, uncertainty, controls, analysis method, and competing explanations. I can structure that evidence review for human confirmation.",
    };
  }

  const returningToMeasurements = /\b(return|back|resume|continue)\b.*\bmeasurements?\b/.test(lower);
  if (returningToMeasurements && previous) {
    return {
      handled: true,
      context: previous,
      href: buildScientistWorkspaceHref(previous),
      message: `The previous measurement workspace is open with the same saved context. ${nextMissingItem(previous)}`,
    };
  }

  const university = extractUniversity(text);
  const unit = extractUnit(text);
  const scientistIntent = /\b(scientist|researcher|research|experiment|university project)\b/.test(lower);
  const contextualAnswer = Boolean(previous && (university || unit));
  if (!scientistIntent && !contextualAnswer) return { handled: false };

  const context: ScientistWorkflowContext = {
    ...(previous ?? EMPTY_CONTEXT),
    role: "scientist",
    universityId: university?.id ?? previous?.universityId ?? null,
    universityName: university?.name ?? previous?.universityName ?? null,
    unitId: unit?.id ?? previous?.unitId ?? null,
    unitSymbol: unit?.symbol ?? previous?.unitSymbol ?? null,
    projectStatement: previous?.projectStatement ?? text.trim(),
    smartIdeaId: previous?.smartIdeaId ?? null,
  };

  return {
    handled: true,
    context,
    href: buildScientistWorkspaceHref(context),
    message: `The Research measurement workspace is open. ${nextMissingItem(context)}`,
  };
}
