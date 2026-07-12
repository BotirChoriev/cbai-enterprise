/**
 * Project-aware Command Center commands (Project Engine Activation mission).
 *
 * The global Command Center has no per-page `?project=` awareness (adding `useSearchParams()` to
 * it would force a Suspense boundary around every page's global chrome — real risk this mission
 * avoids). Instead, "continue project"/"add evidence"/"open notes"/"generate report" operate on
 * the real most-recently-updated project (`loadProjects()` is already sorted that way) — an
 * honest, real interpretation of "continue," never a fabricated current-project guess.
 */

import { loadProjects } from "@/lib/project/project-store";

export type ProjectCommandResult =
  | { type: "navigate"; href: string; message: string }
  | { type: "message"; message: string };

const NO_PROJECTS_MESSAGE = "No projects yet — create one from My Work first.";

function matchesAny(normalized: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => normalized.includes(phrase));
}

const CONTINUE_PROJECT_PHRASES = ["continue project"];
const ADD_EVIDENCE_PHRASES = ["add evidence"];
const OPEN_NOTES_PHRASES = ["open notes", "open project notes"];

/** Resolves project-specific commands against the real most-recently-updated project. */
export function resolveProjectCommand(rawInput: string): ProjectCommandResult | null {
  const normalized = rawInput.trim().toLowerCase();
  if (!normalized) return null;

  const isContinue = matchesAny(normalized, CONTINUE_PROJECT_PHRASES);
  const isAddEvidence = matchesAny(normalized, ADD_EVIDENCE_PHRASES);
  const isOpenNotes = matchesAny(normalized, OPEN_NOTES_PHRASES);

  if (!isContinue && !isAddEvidence && !isOpenNotes) {
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
  return { type: "navigate", href: `/my-work?project=${latest.id}`, message: `Continuing "${latest.title}".` };
}
