/** Semantic version of the agent task model foundation. */
export const AGENT_TASK_MODEL_VERSION = "0.1.0-agent-task-model";

/** Factual task constraint metadata — no execution semantics (BUILD-048). */
export interface TaskConstraints {
  /** Optional maximum duration in milliseconds. */
  maxDurationMs?: number;
  /** Optional ISO-8601 deadline for task completion. */
  deadlineAt?: string;
  /** Optional required capability tags for dispatch matching. */
  requiredCapabilities?: readonly string[];
  /** Optional factual constraint notes. */
  notes?: readonly string[];
}

/** Lightweight task context metadata — no business intelligence. */
export interface TaskRequestContext {
  /** Optional tenant scope. */
  tenantId?: string;
  /** Optional conversation thread identifier. */
  conversationId?: string;
  /** Optional runtime session id reference — not wired in BUILD-048. */
  runtimeSessionId?: string;
  /** Optional factual metadata tags. */
  tags?: readonly string[];
}

/** Task result status classification (BUILD-048). */
export type TaskResultStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "timeout"
  | "unsupported";

/** Reference to diagnostics output — identifier only, no fabricated content. */
export interface TaskDiagnosticsReference {
  /** Optional diagnostics run or issue identifier. */
  id?: string;
  /** Optional source layer label. */
  source?: string;
}

/** Reference to a result artifact — identifier only, no business intelligence. */
export interface TaskResultReference {
  /** Optional result artifact identifier. */
  id?: string;
  /** Optional result kind label (e.g. envelope, trace). */
  kind?: string;
}
