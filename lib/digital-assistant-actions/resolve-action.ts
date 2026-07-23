/**
 * Resolve Digital Assistant action intents (Phase 6).
 * Wired ahead of broader OS routing when a clear action match exists.
 */

import {
  listMissionsAction,
  listPendingApprovalsAction,
  listMentionsAction,
  orgActivitySummaryAction,
  missingEvidenceAction,
  navigateAction,
  type ReadActionDeps,
} from "@/lib/digital-assistant-actions/read-actions";
import {
  draftMissionAction,
  draftTaskAction,
  draftApprovalRequestAction,
  draftReportAction,
  type DraftActionDeps,
} from "@/lib/digital-assistant-actions/draft-actions";
import type { AssistantActionResult } from "@/lib/digital-assistant-actions/types";

export type ResolveAssistantActionDeps = ReadActionDeps & DraftActionDeps;

function normalize(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Detect and run a Phase 6 assistant action from free text.
 * Returns null when no action intent matches (caller continues to OS / voice / evidence).
 */
export function resolveDigitalAssistantAction(
  raw: string,
  deps?: ResolveAssistantActionDeps,
): AssistantActionResult | null {
  const text = normalize(raw);
  if (!text) return null;

  // DRAFT intents first when explicit — always confirmationRequired.
  if (/\bdraft\s+(a\s+)?mission\b/i.test(text) || /\bcreate\s+draft\s+mission\b/i.test(text)) {
    const problem = raw.replace(/.*draft\s+(a\s+)?mission\s*(for|about|:)?\s*/i, "").trim() || raw;
    return draftMissionAction(problem, deps);
  }
  if (/\bdraft\s+(a\s+)?task\b/i.test(text)) {
    const title = raw.replace(/.*draft\s+(a\s+)?task\s*(for|about|:)?\s*/i, "").trim() || "Untitled task";
    const missionMatch = text.match(/mission\s+([a-z0-9_-]+)/i);
    return draftTaskAction(
      { missionId: missionMatch?.[1] ?? "unspecified-mission", title },
      deps,
    );
  }
  if (/\bdraft\s+(an?\s+)?approval(\s+request)?\b/i.test(text)) {
    const title =
      raw.replace(/.*draft\s+(an?\s+)?approval(\s+request)?\s*(for|about|:)?\s*/i, "").trim() ||
      "Approval request";
    return draftApprovalRequestAction({ title }, deps);
  }
  if (/\bdraft\s+(a\s+)?report\b/i.test(text)) {
    const typeMatch = text.match(
      /\b(executive|country|company|university|investor|mission|evidence|risk|comparison|scenario|org activity|approval history)\b/i,
    );
    return draftReportAction(
      {
        reportType: typeMatch?.[1]?.toLowerCase() ?? "executive",
        title: raw.replace(/.*draft\s+(a\s+)?report\s*(for|about|:)?\s*/i, "").trim() || undefined,
      },
      deps,
    );
  }

  // READ intents
  if (/\b(list|show|what are)\s+(my\s+)?missions?\b/i.test(text) || /\bmissions?\s+list\b/i.test(text)) {
    return listMissionsAction(deps);
  }
  if (/\b(list|show|pending)\s+approvals?\b/i.test(text) || /\bmy\s+approvals?\b/i.test(text)) {
    return listPendingApprovalsAction(deps);
  }
  if (/\b(list|show)\s+(my\s+)?mentions?\b/i.test(text) || /\bunread\s+mentions?\b/i.test(text)) {
    return listMentionsAction(deps);
  }
  if (
    /\b(org|organization)\s+activity\b/i.test(text) ||
    /\bactivity\s+summary\b/i.test(text)
  ) {
    return orgActivitySummaryAction(deps);
  }
  if (/\bmissing\s+evidence\b/i.test(text) || /\bunsatisfied\s+evidence\b/i.test(text)) {
    return missingEvidenceAction(deps);
  }

  // Navigate
  const nav = navigateAction(raw, deps);
  if (nav) return nav;

  return null;
}
