/**
 * Digital Assistant OS intent router — extends capabilities without a second voice backend.
 */

import type { PlatformContextSnapshot } from "@/lib/context";
import {
  buildAssistantOsContext,
  syncAssistantOsContext,
  type AssistantOsContext,
} from "@/lib/voice-operator/os/session-context";
import { detectSourceAwarenessIntent } from "@/lib/voice-operator/os/source-awareness";
import { detectSmartSummaryIntent } from "@/lib/voice-operator/os/smart-summaries";
import { detectCrossModuleIntent } from "@/lib/voice-operator/os/cross-module";
import { detectMissionCoachIntent } from "@/lib/voice-operator/os/mission-coach";
import { detectCompareIntent, detectOpenSearchIntent } from "@/lib/voice-operator/os/open-search";
import { buildProactiveSuggestions, type OsSuggestion } from "@/lib/voice-operator/os/proactive-suggestions";
import { detectCollaborationAwarenessIntent } from "@/lib/voice-operator/os/collaboration-awareness";

export type OsIntentResult = {
  readonly assistantText: string;
  readonly href: string;
  readonly suggestions?: readonly OsSuggestion[];
  readonly contextSummary: string;
};

export function resolveDigitalAssistantOsIntent(
  raw: string,
  platform: PlatformContextSnapshot | null,
  pathname: string,
): OsIntentResult | null {
  const os = syncAssistantOsContext(platform, pathname);
  const suggestions = buildProactiveSuggestions(os);

  const withMeta = (assistantText: string, href: string): OsIntentResult => ({
    assistantText,
    href,
    suggestions,
    contextSummary: os.summary,
  });

  const collab = detectCollaborationAwarenessIntent(raw);
  if (collab) return withMeta(collab.assistantText, collab.href);

  const coach = detectMissionCoachIntent(raw);
  if (coach) return withMeta(coach.assistantText, coach.href);

  const sources = detectSourceAwarenessIntent(raw);
  if (sources) return withMeta(sources.assistantText, sources.href);

  const summary = detectSmartSummaryIntent(raw, platform, os);
  if (summary) return withMeta(summary.assistantText, summary.href);

  const compare = detectCompareIntent(raw);
  if (compare) return withMeta(compare.assistantText, compare.href);

  const cross = detectCrossModuleIntent(raw, platform, os);
  if (cross) return withMeta(cross.assistantText, cross.href);

  const openSearch = detectOpenSearchIntent(raw);
  if (openSearch) return withMeta(openSearch.assistantText, openSearch.href);

  return null;
}

export function peekOsContext(
  platform: PlatformContextSnapshot | null,
  pathname: string,
): { context: AssistantOsContext; suggestions: readonly OsSuggestion[] } {
  const context = buildAssistantOsContext(platform, pathname);
  return { context, suggestions: buildProactiveSuggestions(context) };
}

export type { OsSuggestion, AssistantOsContext };
