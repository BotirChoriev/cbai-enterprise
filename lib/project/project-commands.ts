/**
 * Project-aware Command Center commands (Project Engine Activation mission; extended with
 * "open next step" and "generate project report" for the Intelligence Guide Activation mission).
 *
 * The global Command Center has no per-page `?project=` awareness (adding `useSearchParams()` to
 * it would force a Suspense boundary around every page's global chrome — real risk this mission
 * avoids). Instead, every phrase here operates on the real most-recently-updated project
 * (`loadProjects()` is already sorted that way) — an honest, real interpretation of "continue,"
 * never a fabricated current-project guess.
 *
 * Phrases are deliberately distinct from the existing generic table (assistant-commands.ts) and
 * the relationship resolver (assistant-relationship-commands.ts, which already owns the bare
 * "open evidence" phrase for whichever entity is currently focused) — "add evidence"/"open
 * project evidence" and "generate project report" never collide with either.
 */

import { loadProjects } from "@/lib/project/project-store";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";

export type ProjectCommandResult =
  | { type: "navigate"; href: string; message: string }
  | { type: "message"; message: string };

const NO_PROJECTS_MESSAGE = "No projects yet — create one from My Work first.";

function matchesAny(normalized: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => normalized.includes(phrase));
}

// Multilingual equivalents (Global Language Foundation + Multilingual Voice Commands mission,
// Phase 9) — English/Russian/Turkish/Uzbek phrases resolve to the same real project actions.
const CONTINUE_PROJECT_PHRASES = ["continue project", "loyihani davom ettir", "продолжить проект", "projeye devam et"];
const ADD_EVIDENCE_PHRASES = [
  "add evidence", "open project evidence",
  "dalil qo'sh", "dalil qosh",
  "добавить доказательство",
  "kanıt ekle",
];
const OPEN_NOTES_PHRASES = [
  "open notes", "open project notes",
  "eslatmalarni och",
  "открыть заметки",
  "notları aç",
];
const NEXT_STEP_PHRASES = [
  "open next step", "next step", "what's next", "whats next",
  "keyingi qadam",
  "следующий шаг",
  "sıradaki adım",
];
const GENERATE_REPORT_PHRASES = ["generate project report", "loyiha hisobotini yarat", "создать отчёт по проекту", "proje raporu oluştur"];

/** Resolves project-specific commands against the real most-recently-updated project. */
export function resolveProjectCommand(rawInput: string): ProjectCommandResult | null {
  const normalized = rawInput.trim().toLowerCase();
  if (!normalized) return null;

  const isContinue = matchesAny(normalized, CONTINUE_PROJECT_PHRASES);
  const isAddEvidence = matchesAny(normalized, ADD_EVIDENCE_PHRASES);
  const isOpenNotes = matchesAny(normalized, OPEN_NOTES_PHRASES);
  const isNextStep = matchesAny(normalized, NEXT_STEP_PHRASES);
  const isGenerateReport = matchesAny(normalized, GENERATE_REPORT_PHRASES);

  if (!isContinue && !isAddEvidence && !isOpenNotes && !isNextStep && !isGenerateReport) {
    return null;
  }

  const projects = loadProjects();
  const latest = projects[0];
  if (!latest) {
    return { type: "message", message: NO_PROJECTS_MESSAGE };
  }

  if (isAddEvidence) {
    return { type: "navigate", href: `/my-work?project=${latest.id}#project-evidence`, message: `Opening evidence for "${latest.title}".` };
  }
  if (isOpenNotes) {
    return { type: "navigate", href: `/my-work?project=${latest.id}#project-notes`, message: `Opening notes for "${latest.title}".` };
  }
  if (isGenerateReport) {
    return { type: "navigate", href: `/my-work?project=${latest.id}#project-report`, message: `Opening the report for "${latest.title}".` };
  }
  if (isNextStep) {
    const step = resolveProjectGuideStep(latest);
    return { type: "navigate", href: step.href, message: step.suggestion };
  }
  return { type: "navigate", href: `/my-work?project=${latest.id}`, message: `Continuing "${latest.title}".` };
}
