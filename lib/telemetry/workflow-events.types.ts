/** BUILD-027 — Privacy-conscious workflow telemetry event taxonomy. */

export type WorkflowEventName =
  | "journey_started"
  | "journey_completed"
  | "journey_abandoned"
  | "mission_started"
  | "mission_resumed"
  | "intent_resolved"
  | "intent_unresolved"
  | "route_opened"
  | "primary_action_shown"
  | "primary_action_started"
  | "primary_action_completed"
  | "primary_action_failed"
  | "source_search_started"
  | "source_search_completed"
  | "source_search_failed"
  | "source_opened"
  | "evidence_linked"
  | "evidence_unlinked"
  | "note_created"
  | "finding_created"
  | "review_opened"
  | "report_blocked"
  | "report_ready"
  | "report_saved"
  | "permission_denied"
  | "error_recovered"
  | "user_test_started"
  | "user_test_completed"
  | "user_test_abandoned"
  | "user_test_feedback";

export type WorkflowEventPayload = {
  readonly event: WorkflowEventName;
  readonly timestamp: string;
  /** Object category only — never raw user text, note bodies, or voice audio. */
  readonly objectType?: string;
  readonly objectId?: string;
  readonly route?: string;
  readonly intentCategory?: string;
  readonly taskCode?: string;
  readonly difficulty?: "none" | "minor" | "major";
  readonly outcome?: "success" | "failure" | "cancelled";
  readonly errorCategory?: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
};

export type UserTestTaskDefinition = {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly journeyEvent: WorkflowEventName;
};

export const USER_TEST_TASKS: readonly UserTestTaskDefinition[] = [
  {
    code: "T01",
    title: "Start mission by typing",
    description: "Type a mission problem and create a mission from home.",
    journeyEvent: "mission_started",
  },
  {
    code: "T02",
    title: "Resume mission after reload",
    description: "Reload the page and confirm mission state persists.",
    journeyEvent: "mission_resumed",
  },
  {
    code: "T03",
    title: "Link evidence to project",
    description: "Add evidence to an active project from My Work.",
    journeyEvent: "evidence_linked",
  },
  {
    code: "T04",
    title: "Record research note",
    description: "Save a note on a research topic workspace.",
    journeyEvent: "note_created",
  },
  {
    code: "T05",
    title: "Search scholarly sources",
    description: "Run a knowledge source search and inspect provenance.",
    journeyEvent: "source_search_completed",
  },
] as const;
