/**
 * Genesis Operator commands — deterministic phrase router with evidence-linked answers.
 */

import { buildGenesisOperatorSnapshot } from "@/lib/genesis/genesis-operator-snapshot";
import { loadOpenBlockers, loadBlockers } from "@/lib/genesis/blocker-store";
import { loadProgressUpdates } from "@/lib/genesis/progress-update-store";
import { loadOutcomes } from "@/lib/genesis/outcome-store";
import { loadContributionClaims, loadRecognitionRecords } from "@/lib/genesis/contribution-store";
import { loadExecutionTasks } from "@/lib/genesis/execution-store";
import { loadGenesisAudit } from "@/lib/genesis/genesis-audit-store";

export type GenesisCommandMatch = {
  readonly type: "answer";
  readonly message: string;
  readonly href?: string;
  readonly matchedKeyword: string;
};

const GENESIS_COMMANDS: readonly { keywords: readonly string[]; answer: (operatorName?: string) => GenesisCommandMatch }[] = [
  {
    keywords: [
      "what requires attention",
      "requires attention",
      "what needs attention",
      "show attention",
    ],
    answer: (operatorName) => ({
      type: "answer",
      message: buildAttentionAnswer(operatorName),
      href: "/my-work#attention",
      matchedKeyword: "what requires attention",
    }),
  },
  {
    keywords: ["what is blocked", "what's blocked", "show blocked", "blocked tasks"],
    answer: () => ({
      type: "answer",
      message: buildBlockedAnswer(),
      href: "/organization",
      matchedKeyword: "what is blocked",
    }),
  },
  {
    keywords: ["what changed today", "changes today", "today's changes genesis"],
    answer: () => ({
      type: "answer",
      message: buildTodayChangesAnswer(),
      href: "/organization",
      matchedKeyword: "what changed today",
    }),
  },
  {
    keywords: [
      "tasks need progress",
      "progress updates needed",
      "which tasks need progress",
    ],
    answer: () => ({
      type: "answer",
      message: buildProgressNeededAnswer(),
      href: "/organization",
      matchedKeyword: "tasks need progress",
    }),
  },
  {
    keywords: [
      "decisions require human review",
      "human decision required",
      "which decisions require",
    ],
    answer: () => ({
      type: "answer",
      message: buildHumanDecisionAnswer(),
      href: "/organization",
      matchedKeyword: "human decision required",
    }),
  },
  {
    keywords: ["outcomes lack evidence", "which outcomes lack evidence", "missing outcome evidence"],
    answer: () => ({
      type: "answer",
      message: buildOutcomesMissingEvidenceAnswer(),
      href: "/my-work",
      matchedKeyword: "outcomes lack evidence",
    }),
  },
  {
    keywords: [
      "contribution claims under review",
      "contributions under review",
      "which contribution",
    ],
    answer: () => ({
      type: "answer",
      message: buildContributionsReviewAnswer(),
      href: "/my-work",
      matchedKeyword: "contribution claims under review",
    }),
  },
  {
    keywords: [
      "recognition records need review",
      "recognition need review",
      "which recognition",
    ],
    answer: () => ({
      type: "answer",
      message: buildRecognitionReviewAnswer(),
      href: "/my-work",
      matchedKeyword: "recognition records need review",
    }),
  },
  {
    keywords: ["what should i do next", "next action genesis"],
    answer: (operatorName) => ({
      type: "answer",
      message: buildNextActionAnswer(operatorName),
      href: "/my-work#attention",
      matchedKeyword: "what should i do next",
    }),
  },
];

function scopeNote(): string {
  return "Scope: device-local records on this device. Final decisions remain with qualified humans.";
}

function buildAttentionAnswer(operatorName?: string): string {
  const snap = buildGenesisOperatorSnapshot(operatorName);
  const parts = [...snap.attentionItems];
  if (snap.nextActionLabel) parts.unshift(`Next action: ${snap.nextActionLabel}`);
  if (parts.length === 0) parts.push("Nothing flagged from current local records.");
  parts.push(scopeNote());
  return parts.join(" ");
}

function buildBlockedAnswer(): string {
  const open = loadOpenBlockers();
  const tasks = loadExecutionTasks();
  const blockedTasks = tasks.filter((t) => t.status === "Blocked");
  const parts: string[] = [];
  if (open.length > 0) {
    parts.push(`${open.length} open blocker record(s): ${open.map((b) => b.description.slice(0, 60)).join("; ")}`);
  }
  if (blockedTasks.length > 0) {
    parts.push(`${blockedTasks.length} task(s) with Blocked status.`);
  }
  if (parts.length === 0) parts.push("No blocked tasks or open blockers in local records.");
  parts.push(scopeNote());
  return parts.join(" ");
}

function buildTodayChangesAnswer(): string {
  const today = new Date().toISOString().slice(0, 10);
  const audit = loadGenesisAudit().filter((a) => a.timestamp.startsWith(today));
  if (audit.length === 0) {
    return `No Genesis audit events recorded today (${today}). ${scopeNote()}`;
  }
  const summary = audit
    .slice(0, 8)
    .map((a) => `${a.action} on ${a.recordType}`)
    .join("; ");
  return `Today (${today}): ${audit.length} event(s) — ${summary}. ${scopeNote()}`;
}

function buildProgressNeededAnswer(): string {
  const tasks = loadExecutionTasks().filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
  const needing = tasks.filter((t) => {
    const updates = loadProgressUpdates({ taskId: t.id });
    const weekAgo = Date.now() - 7 * 86400000;
    const latest = updates[0];
    return !latest || new Date(latest.reportedDate).getTime() < weekAgo;
  });
  if (needing.length === 0) {
    return `All active tasks have a progress update within the last 7 days, or no active tasks exist. ${scopeNote()}`;
  }
  return `${needing.length} active task(s) may need a progress update: ${needing.map((t) => t.title).join(", ")}. ${scopeNote()}`;
}

function buildHumanDecisionAnswer(): string {
  const blockers = loadBlockers().filter(
    (b) =>
      (b.status === "Open" || b.status === "Action Required") &&
      (b.blockerType === "Human Decision Required" || b.requiredDecision.trim().length > 0),
  );
  if (blockers.length === 0) {
    return `No blockers explicitly requiring human decision in local records. ${scopeNote()}`;
  }
  return `${blockers.length} blocker(s) require human decision: ${blockers.map((b) => b.requiredDecision || b.description).join("; ")}. ${scopeNote()}`;
}

function buildOutcomesMissingEvidenceAnswer(): string {
  const missing = loadOutcomes().filter(
    (o) => o.verificationStatus === "Draft" || o.verificationStatus === "Evidence Missing",
  );
  if (missing.length === 0) {
    return `No outcomes with missing evidence in local records. ${scopeNote()}`;
  }
  return `${missing.length} outcome(s) lack evidence: ${missing.map((o) => o.title).join(", ")}. ${scopeNote()}`;
}

function buildContributionsReviewAnswer(): string {
  const pending = loadContributionClaims().filter(
    (c) => c.state === "Under Review" || c.state === "Claimed" || c.state === "Evidence Submitted",
  );
  if (pending.length === 0) {
    return `No contribution claims awaiting review. ${scopeNote()}`;
  }
  return `${pending.length} contribution claim(s) under review. ${scopeNote()}`;
}

function buildRecognitionReviewAnswer(): string {
  const pending = loadRecognitionRecords().filter(
    (r) => r.status === "Draft" || r.status === "Evidence Incomplete" || r.status === "Under Independent Review",
  );
  if (pending.length === 0) {
    return `No recognition records awaiting review. ${scopeNote()}`;
  }
  return `${pending.length} recognition record(s) need review. ${scopeNote()}`;
}

function buildNextActionAnswer(operatorName?: string): string {
  const snap = buildGenesisOperatorSnapshot(operatorName);
  if (snap.nextActionLabel) {
    return `Next honest action: ${snap.nextActionLabel}. ${scopeNote()}`;
  }
  return buildAttentionAnswer(operatorName);
}

export function resolveGenesisCommand(input: string, operatorName?: string): GenesisCommandMatch | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;
  for (const cmd of GENESIS_COMMANDS) {
    for (const keyword of cmd.keywords) {
      if (normalized.includes(keyword)) {
        return cmd.answer(operatorName);
      }
    }
  }
  return null;
}
