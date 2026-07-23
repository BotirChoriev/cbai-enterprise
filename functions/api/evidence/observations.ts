/**
 * Cloudflare Pages Function — GET/POST /api/evidence/observations
 * Refreshes official connectors and returns verified observations only.
 */

import { refreshOfficialConnectors } from "../../../lib/official-connectors/pipeline";
import {
  listObservations,
  listConnectorHealth,
  connectedSourceSlugs,
  observationCount,
} from "../../../lib/official-connectors/store";
import {
  generateEvidenceReport,
  generateExecutiveSummary,
} from "../../../lib/official-connectors/reports";

export interface Env {
  readonly CENSUS_API_KEY?: string;
  readonly BEA_API_KEY?: string;
  readonly VOICE_ALLOWED_ORIGINS?: string;
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
    // Always refresh before report generation so citations exist in this isolate.
    if (refresh || report) {
      refreshReport = await refreshOfficialConnectors({
        countryId: entityId && !entityId.includes(":") ? entityId : "usa",
        censusApiKey: env.CENSUS_API_KEY,
        beaApiKey: env.BEA_API_KEY,
      });
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
      health: listConnectorHealth(),
      observations: entityId ? listObservations({ entityId }) : listObservations(),
      refresh: refreshReport,
      principles: {
        noInventedValues: true,
        humanDecisionRequired: true,
        noJudgments: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json(request, env, { ok: false, error: message }, 500);
  }
};
