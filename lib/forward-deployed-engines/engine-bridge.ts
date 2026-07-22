/**
 * Engine action bridge — connects platform-actions to EngineWorkspace without circular imports.
 */

import type { ForwardDeployedEngineId } from "@/lib/forward-deployed-engines/engine-types";
import { startEngineRun } from "@/lib/forward-deployed-engines/engine-runner";
import { resolveEngineContextFromRoute } from "@/lib/forward-deployed-engines/engine-context";
import type { OntologyLocale } from "@/lib/ontology/types";

export type EngineStartPayload = {
  readonly engineId: ForwardDeployedEngineId;
  readonly statement: string;
  readonly pathname: string;
  readonly locale: OntologyLocale;
  readonly entityId?: string;
  readonly entityName?: string;
  readonly countryCode?: string;
  readonly domain?: string;
  readonly topicId?: string;
};

type EngineStartListener = (result: ReturnType<typeof startEngineRun>) => void;

let listener: EngineStartListener | null = null;

export function registerEngineStartListener(fn: EngineStartListener | null): void {
  listener = fn;
}

export function invokeEngineStart(payload: EngineStartPayload): ReturnType<typeof startEngineRun> {
  const context = resolveEngineContextFromRoute(payload.pathname, payload.locale, {
    entityId: payload.entityId,
    entityName: payload.entityName,
    countryCode: payload.countryCode,
    topicId: payload.topicId,
  });
  const result = startEngineRun({
    engineId: payload.engineId,
    objective: { statement: payload.statement, locale: payload.locale, domain: payload.domain },
    context,
  });
  listener?.(result);
  return result;
}

export function engineIdFromAction(actionId: string): ForwardDeployedEngineId | null {
  const map: Record<string, ForwardDeployedEngineId> = {
    "engine.research.start": "research",
    "engine.evidence.start": "evidence",
    "engine.country.start": "country_intelligence",
    "engine.organization.start": "organization_intelligence",
    "engine.mission.start": "mission",
    "engine.governance.start": "governance_review",
    "engine.meeting.start": "multilingual_meeting",
  };
  return map[actionId] ?? null;
}
