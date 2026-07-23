/**
 * Cloudflare Pages Function — GET/POST /api/evidence-observations
 * Refreshes official connectors and returns verified observations only.
 * Runtime secrets: CENSUS_API_KEY, BEA_API_KEY (never exposed to client).
 */

import { refreshOfficialConnectors } from "../../lib/official-connectors/pipeline";
import {
  listObservations,
  listConnectorHealth,
  connectedSourceSlugs,
  observationCount,
  exportAllVersions,
  listConnectorHealthHistory,
} from "../../lib/official-connectors/store";
import { listConnectionStatuses } from "../../lib/official-connectors/connection-status";
import {
  generateEvidenceReport,
  generateExecutiveSummary,
} from "../../lib/official-connectors/reports";
import {
  buildImmutableSourceRecords,
  persistVerifiedBundle,
  persistenceStatus,
  type EvidenceKvNamespace,
} from "../../lib/official-connectors/persistence/kv-store";

export interface Env {
  readonly CENSUS_API_KEY?: string;
  readonly BEA_API_KEY?: string;
  readonly VOICE_ALLOWED_ORIGINS?: string;
  readonly EVIDENCE_OBSERVATIONS_KV?: EvidenceKvNamespace;
}

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
}) => Response | Promise<Response>;

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin");
  const allowed = (env.VOICE_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const allow =
    origin &&
    (allowed.includes(origin) ||
      origin.endsWith(".cbai-enterprise.pages.dev") ||
      origin.includes("localhost"));
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...(allow
      ? {
          "access-control-allow-origin": origin,
          "access-control-allow-credentials": "true",
          "access-control-allow-headers": "content-type",
          "access-control-allow-methods": "GET,POST,OPTIONS",
        }
      : {}),
  };
}

function json(request: Request, env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request, env) });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  const url = new URL(request.url);
  const entityId = url.searchParams.get("entityId") ?? undefined;
  const refresh = url.searchParams.get("refresh") === "1" || request.method === "POST";
  const report = url.searchParams.get("report");

  try {
    let refreshReport = null;
    if (refresh || report) {
      refreshReport = await refreshOfficialConnectors({
        countryId: entityId && !entityId.includes(":") ? entityId : "usa",
        censusApiKey: env.CENSUS_API_KEY,
        beaApiKey: env.BEA_API_KEY,
        markConnectedOnSuccess: true,
      });

      const observations = listObservations();
      const persist = await persistVerifiedBundle(
        {
          immutableSourceRecords: buildImmutableSourceRecords(observations),
          versions: exportAllVersions(),
          healthHistory: listConnectorHealth().flatMap((h) =>
            listConnectorHealthHistory(h.connectorId),
          ),
          writtenAt: new Date().toISOString(),
        },
        env.EVIDENCE_OBSERVATIONS_KV,
      );
      refreshReport = { ...refreshReport, persistence: persist };
    }

    if (report === "evidence") {
      return json(request, env, { ok: true, report: generateEvidenceReport(entityId), refresh: refreshReport });
    }
    if (report === "executive") {
      return json(request, env, { ok: true, report: generateExecutiveSummary(entityId), refresh: refreshReport });
    }

    return json(request, env, {
      ok: true,
      observationCount: observationCount(),
      connectedSources: connectedSourceSlugs(),
      connectionStatuses: listConnectionStatuses(),
      health: listConnectorHealth(),
      observations: entityId ? listObservations({ entityId }) : listObservations(),
      refresh: refreshReport,
      persistence: persistenceStatus(env.EVIDENCE_OBSERVATIONS_KV),
      principles: {
        noInventedValues: true,
        humanDecisionRequired: true,
        noJudgments: true,
        connectedOnlyAfterPagesFunctionSuccess: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json(request, env, { ok: false, error: message }, 500);
  }
};
