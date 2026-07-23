/**
 * Cloudflare Pages Function — GET/POST /api/foundation-wdi
 * First live connector: World Bank WDI via Official Connector Foundation only.
 */

import {
  fetchWorldBankWdiForCountry,
  foundationWdiStore,
  getWorldBankRuntimeStatus,
  getFoundationSourceBySlug,
  getFoundationConnectorById,
  assertUnrelatedConnectorsRemainPlanned,
  missingSourceFallback,
} from "../../lib/official-connector-foundation/index";

export interface Env {
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
  const entityId = url.searchParams.get("entityId") ?? "usa";
  const refresh = url.searchParams.get("refresh") === "1" || request.method === "POST";

  try {
    assertUnrelatedConnectorsRemainPlanned();

    let refreshResult = null;
    if (refresh) {
      foundationWdiStore.clear();
      refreshResult = await fetchWorldBankWdiForCountry(entityId);
    }

    const observations = foundationWdiStore
      .list()
      .filter((item) => item.entityId === entityId || !entityId);
    const wbStatus = getWorldBankRuntimeStatus();
    const source = getFoundationSourceBySlug("world-bank");
    const contract = getFoundationConnectorById("fconn-world-bank-wdi");

    if (observations.length === 0) {
      return json(request, env, {
        ok: true,
        connector: "world-bank-wdi",
        connected: wbStatus.status === "connected",
        connectionStatus: wbStatus.status,
        source,
        contract,
        observations: [],
        fallback: missingSourceFallback({
          sourceSlug: "world-bank",
          indicatorName: "WDI",
          jurisdiction: entityId,
        }),
        refresh: refreshResult,
        principles: {
          foundationOnly: true,
          noInventedValues: true,
          onlyWorldBankMayConnect: true,
        },
      });
    }

    return json(request, env, {
      ok: true,
      connector: "world-bank-wdi",
      connected: wbStatus.status === "connected",
      connectionStatus: wbStatus.status,
      source,
      contract,
      observations,
      refresh: refreshResult,
      principles: {
        foundationOnly: true,
        noInventedValues: true,
        onlyWorldBankMayConnect: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json(request, env, { ok: false, error: message }, 500);
  }
};
