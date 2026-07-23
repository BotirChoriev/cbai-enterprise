/**
 * Digital Assistant intent — mission create/continue when the user asks to analyze or investigate.
 */

import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { myWorkHrefForMission } from "@/lib/intelligence-os/mission-operating-context";

export const PENDING_MISSION_PROBLEM_KEY = "cbai-digital-assistant-pending-mission-problem";

const ANALYZE_INTENT =
  /\b(analy[sz]e|investigat|study|examine|assess|evaluate|deep.?dive|look into|research this|research the|tahlil|o'?rgan|tekshir|bahola|tasdiqla|izlan)\b/i;

const EXPLICIT_START =
  /\b(start (a )?mission|new mission|create (a )?mission|missiyani boshl|yangi missiya|начать миссию|görev başlat)\b/i;

const EXPLICIT_CONTINUE =
  /\b(continue (my )?(active )?mission|resume mission|missiyani davom|продолжить миссию|göreve devam)\b/i;

export type MissionAssistantAction = {
  readonly kind: "create" | "continue";
  readonly href: string;
  readonly assistantText: string;
  readonly problemSeed?: string;
};

function stripAnalyzePrefix(text: string): string {
  return text
    .replace(
      /^(please\s+)?(can you\s+)?(analy[sz]e|investigat\w*|study|examine|assess|evaluate|look into|research)\s+(this|the|on|about)?\s*/i,
      "",
    )
    .replace(/^(tahlil\s+qil|o'?rgan|tekshir)\s*/i, "")
    .trim();
}

export function detectMissionAssistantIntent(
  rawInput: string,
  language: string,
): MissionAssistantAction | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const mission = getCurrentMission();
  const lower = trimmed.toLowerCase();

  if (EXPLICIT_CONTINUE.test(lower)) {
    if (mission) {
      return {
        kind: "continue",
        href: myWorkHrefForMission(mission),
        assistantText: continueMessage(language, mission.problem),
      };
    }
    return {
      kind: "create",
      href: "/?create=1",
      assistantText: noMissionCreateMessage(language),
    };
  }

  if (EXPLICIT_START.test(lower) || ANALYZE_INTENT.test(lower)) {
    if (mission && !EXPLICIT_START.test(lower) && ANALYZE_INTENT.test(lower)) {
      // Prefer continuing the active mission when analyzing in context.
      return {
        kind: "continue",
        href: myWorkHrefForMission(mission),
        assistantText: continueAnalyzeMessage(language, mission.problem),
        problemSeed: stripAnalyzePrefix(trimmed) || undefined,
      };
    }

    const seed = stripAnalyzePrefix(trimmed);
    return {
      kind: "create",
      href: "/?create=1",
      assistantText: createMessage(language, seed),
      problemSeed: seed.length >= 8 ? seed : trimmed,
    };
  }

  return null;
}

export function writePendingMissionProblem(problem: string): void {
  if (typeof window === "undefined") return;
  const value = problem.trim();
  if (value.length < 8) return;
  try {
    window.sessionStorage.setItem(PENDING_MISSION_PROBLEM_KEY, value.slice(0, 2000));
  } catch {
    /* ignore quota */
  }
}

export function consumePendingMissionProblem(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(PENDING_MISSION_PROBLEM_KEY);
    if (!value) return null;
    window.sessionStorage.removeItem(PENDING_MISSION_PROBLEM_KEY);
    return value;
  } catch {
    return null;
  }
}

function createMessage(language: string, seed: string): string {
  if (language === "uz") {
    return seed
      ? `Missiya yaratishni ochaman. Muammo: «${seed.slice(0, 120)}».`
      : "Yangi missiya yaratish oqimini ochaman.";
  }
  return seed
    ? `Opening Mission creation for: “${seed.slice(0, 120)}”.`
    : "Opening Mission creation so we can structure this as mission work.";
}

function continueMessage(language: string, problem: string): string {
  if (language === "uz") {
    return `Faol missiyangizni davom ettiraman: «${problem.slice(0, 100)}».`;
  }
  return `Continuing your active mission: “${problem.slice(0, 100)}”.`;
}

function continueAnalyzeMessage(language: string, problem: string): string {
  if (language === "uz") {
    return `Tahlil uchun faol missiyaga qaytaman: «${problem.slice(0, 100)}».`;
  }
  return `Taking this analysis into your active mission: “${problem.slice(0, 100)}”.`;
}

function noMissionCreateMessage(language: string): string {
  if (language === "uz") {
    return "Faol missiya yo‘q — yangi missiya yaratishni ochaman.";
  }
  return "No active mission yet — opening Mission creation.";
}
