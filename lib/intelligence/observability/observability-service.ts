import type { AgentRuntimeContract } from "@/lib/intelligence/agents/runtime/agent-contract";
import { localRuntimeAdapter } from "@/lib/intelligence/agents/providers/local";
import type { AgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { defaultAgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import type { RuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import { defaultRuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import type { SessionRegistry } from "@/lib/intelligence/runtime/registry/session-registry";
import { defaultSessionRegistry } from "@/lib/intelligence/runtime/registry/session-registry";
import type { RuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import { defaultRuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import { collectAgentMetrics } from "@/lib/intelligence/observability/agent-metrics";
import { collectHealthSummary } from "@/lib/intelligence/observability/health-summary";
import { collectRuntimeMetrics } from "@/lib/intelligence/observability/runtime-metrics";
import type {
  AgentMetrics,
  HealthSummary,
  ObservabilityCollectInput,
  ObservabilitySnapshot,
  RuntimeMetrics,
} from "@/lib/intelligence/observability/types";
import { RUNTIME_OBSERVABILITY_VERSION } from "@/lib/intelligence/observability/types";

/** Stable identifier for the default observability service. */
export const DEFAULT_OBSERVABILITY_SERVICE_ID = "default-observability-service";

/**
 * Dependencies for observability collection (BUILD-058).
 */
export interface ObservabilityDependencies {
  sessionRegistry?: SessionRegistry;
  queue?: RuntimeQueue;
  scheduler?: RuntimeScheduler;
  taskStore?: AgentTaskStore;
  localAdapter?: AgentRuntimeContract;
}

/**
 * Contract for the CBAI Runtime Observability Service (BUILD-058).
 *
 * Deterministic snapshots across runtime and agent layers.
 * No external telemetry, vendors, or browser storage.
 */
export interface ObservabilityService {
  /** Collect full observability snapshot. */
  collect(input?: ObservabilityCollectInput): ObservabilitySnapshot;

  /** Collect runtime layer metrics only. */
  collectRuntimeMetrics(input?: ObservabilityCollectInput): RuntimeMetrics;

  /** Collect agent layer metrics only. */
  collectAgentMetrics(): AgentMetrics;

  /** Collect unified health summary from current metrics. */
  collectHealthSummary(input?: ObservabilityCollectInput): HealthSummary;
}

/**
 * Default runtime observability service (BUILD-058).
 */
export class DefaultObservabilityService implements ObservabilityService {
  private readonly deps: Required<ObservabilityDependencies>;

  constructor(deps: ObservabilityDependencies = {}) {
    this.deps = {
      sessionRegistry: deps.sessionRegistry ?? defaultSessionRegistry,
      queue: deps.queue ?? defaultRuntimeQueue,
      scheduler: deps.scheduler ?? defaultRuntimeScheduler,
      taskStore: deps.taskStore ?? defaultAgentTaskStore,
      localAdapter: deps.localAdapter ?? localRuntimeAdapter,
    };
  }

  collect(input?: ObservabilityCollectInput): ObservabilitySnapshot {
    const runtime = this.collectRuntimeMetrics(input);
    const agent = this.collectAgentMetrics();
    const health = collectHealthSummary({ runtime, agent });

    return {
      collectedAt: input?.evaluatedAt ?? new Date().toISOString(),
      observabilityVersion: RUNTIME_OBSERVABILITY_VERSION,
      runtime,
      agent,
      health,
    };
  }

  collectRuntimeMetrics(input?: ObservabilityCollectInput): RuntimeMetrics {
    return collectRuntimeMetrics({
      sessionRegistry: this.deps.sessionRegistry,
      queue: this.deps.queue,
      scheduler: this.deps.scheduler,
      collectInput: input,
    });
  }

  collectAgentMetrics(): AgentMetrics {
    return collectAgentMetrics({
      taskStore: this.deps.taskStore,
      localAdapter: this.deps.localAdapter,
    });
  }

  collectHealthSummary(input?: ObservabilityCollectInput): HealthSummary {
    const runtime = this.collectRuntimeMetrics(input);
    const agent = this.collectAgentMetrics();
    return collectHealthSummary({ runtime, agent });
  }
}

/** Shared default observability service singleton. */
export const defaultObservabilityService = new DefaultObservabilityService();

/**
 * Convenience helper — collect full observability snapshot.
 */
export function collectObservabilitySnapshot(
  input?: ObservabilityCollectInput,
  service: ObservabilityService = defaultObservabilityService,
): ObservabilitySnapshot {
  return service.collect(input);
}
