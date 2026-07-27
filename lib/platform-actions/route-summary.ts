/**
 * Route-aware summary from visible / local context only — no invented evidence.
 */

export type RouteSummarySection = {
  readonly verified: readonly string[];
  readonly unknown: readonly string[];
  readonly conflict: readonly string[];
  readonly limitation: readonly string[];
  readonly nextStep: string;
};

export type RouteSummaryInput = {
  readonly pathname: string;
  readonly locale: string;
  readonly entityName?: string | null;
  readonly entityKind?: string | null;
  readonly filterLabel?: string | null;
  readonly resultCount?: number | null;
  readonly evidenceConnected?: number | null;
  readonly evidenceTotal?: number | null;
  readonly selectedGraphLabel?: string | null;
  readonly activeWorkTitles?: readonly string[];
  readonly roomLifecycle?: string | null;
  readonly micLive?: boolean;
  readonly notes?: readonly string[];
};

export type RouteSummaryResult = {
  readonly spoken: string;
  readonly transcript: string;
  readonly sections: RouteSummarySection;
  readonly canCreateWork: boolean;
};

function joinList(items: readonly string[], empty: string): string {
  return items.length ? items.join("; ") : empty;
}

export function buildRouteSummary(input: RouteSummaryInput): RouteSummaryResult {
  const path = input.pathname.split("?")[0] || "/";
  const verified: string[] = [];
  const unknown: string[] = [];
  const conflict: string[] = [];
  const limitation: string[] = [];
  let nextStep = "Review the page and confirm any draft before creating work.";

  if (input.entityName) {
    verified.push(`${input.entityKind ?? "entity"}: ${input.entityName}`);
  }
  if (typeof input.resultCount === "number") {
    verified.push(`Visible results: ${input.resultCount}`);
  }
  if (input.filterLabel) {
    verified.push(`Active filter: ${input.filterLabel}`);
  }
  if (typeof input.evidenceConnected === "number" && typeof input.evidenceTotal === "number") {
    verified.push(`Sources connected: ${input.evidenceConnected} of ${input.evidenceTotal}`);
    if (input.evidenceConnected < input.evidenceTotal) {
      unknown.push("Some listed sources are not connected.");
      nextStep = "Create an evidence request for missing sources, or open connected sources.";
    }
  }
  if (input.selectedGraphLabel) {
    verified.push(`Graph selection: ${input.selectedGraphLabel}`);
  }
  if (input.activeWorkTitles?.length) {
    verified.push(`Active work: ${input.activeWorkTitles.slice(0, 3).join(", ")}`);
  } else if (path === "/my-work") {
    unknown.push("No active work titles were provided for this summary.");
  }
  if (path.startsWith("/rooms")) {
    if (input.roomLifecycle) verified.push(`Room lifecycle: ${input.roomLifecycle}`);
    verified.push(input.micLive ? "Host microphone is live via Voice Operator." : "Host microphone is not capturing.");
    limitation.push("Multi-party live audio is not implemented; listeners may be simulated.");
    nextStep = input.micLive ? "Pause or end the room to release the microphone." : "Acknowledge consent, then Go Live to start host capture.";
  }
  if (path === "/reports") {
    limitation.push("Reports remain gated on real evidence readiness.");
    nextStep = "Check evidence readiness before generating a report.";
  }
  if (input.notes?.length) {
    verified.push(...input.notes);
  }
  if (!verified.length && !unknown.length) {
    unknown.push("No entity or work context is selected on this page.");
    nextStep = "Select an entity or open My Work, then ask again.";
  }

  const sections: RouteSummarySection = {
    verified,
    unknown,
    conflict,
    limitation,
    nextStep,
  };

  const spoken = [
    verified.length ? `Known: ${joinList(verified, "none")}.` : "",
    unknown.length ? `Unknown: ${joinList(unknown, "none")}.` : "",
    conflict.length ? `Conflicts: ${joinList(conflict, "none")}.` : "",
    limitation.length ? `Limits: ${joinList(limitation, "none")}.` : "",
    `Next: ${nextStep}`,
  ]
    .filter(Boolean)
    .join(" ");

  const transcript = [
    "## Route summary",
    `Path: ${path}`,
    "",
    "### Verified / available",
    ...verified.map((v) => `- ${v}`),
    "",
    "### Unknown",
    ...unknown.map((v) => `- ${v}`),
    "",
    "### Conflict",
    ...(conflict.length ? conflict.map((v) => `- ${v}`) : ["- none"]),
    "",
    "### Limitation",
    ...limitation.map((v) => `- ${v}`),
    "",
    "### Recommended next step",
    `- ${nextStep}`,
  ].join("\n");

  return {
    spoken,
    transcript,
    sections,
    canCreateWork: Boolean(input.entityName || input.activeWorkTitles?.length || path === "/my-work" || path.startsWith("/research")),
  };
}
