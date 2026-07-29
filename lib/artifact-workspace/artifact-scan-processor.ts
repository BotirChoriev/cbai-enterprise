const MAX_ARTIFACT_BYTES = 209_715_200;

export type ArtifactScanProcessorEnv = {
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
  readonly ARTIFACT_SCANNER_URL?: string;
  readonly ARTIFACT_SCANNER_TOKEN?: string;
  readonly ARTIFACT_ALLOWED_ORIGINS?: string;
};

type ArtifactRecord = {
  readonly id: string;
  readonly owner_user_id: string;
  readonly bucket: string;
  readonly storage_key: string;
  readonly byte_size: number;
  readonly checksum_sha256: string;
  readonly scan_status: string;
};

type ScannerResult = {
  readonly status: "clean" | "infected";
  readonly scanner: string;
  readonly signature: string | null;
  readonly sha256: string;
};

function responseHeaders(origin?: string | null): HeadersInit {
  return {
    "content-type": "application/json; charset=utf-8",
    ...(origin
      ? {
          "access-control-allow-origin": origin,
          "access-control-allow-headers": "authorization, content-type",
          "access-control-allow-methods": "POST, OPTIONS",
          vary: "Origin",
        }
      : {}),
  };
}

function json(status: number, body: Record<string, unknown>, origin?: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

function allowedOrigins(value: string | undefined): ReadonlySet<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function serviceHeaders(env: ArtifactScanProcessorEnv): HeadersInit {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
    "content-type": "application/json",
  };
}

function configured(env: ArtifactScanProcessorEnv): boolean {
  return Boolean(
    env.SUPABASE_URL?.trim()
      && env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      && env.ARTIFACT_SCANNER_URL?.trim()
      && env.ARTIFACT_SCANNER_TOKEN?.trim()
      && env.ARTIFACT_ALLOWED_ORIGINS?.trim(),
  );
}

async function markArtifact(
  env: ArtifactScanProcessorEnv,
  artifactId: string,
  patch: Record<string, unknown>,
  fetchFn: typeof fetch,
): Promise<boolean> {
  const response = await fetchFn(
    `${env.SUPABASE_URL}/rest/v1/document_artifacts?id=eq.${encodeURIComponent(artifactId)}`,
    {
      method: "PATCH",
      headers: {
        ...serviceHeaders(env),
        prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
    },
  );
  return response.ok;
}

export async function handleArtifactScanRequest(
  request: Request,
  env: ArtifactScanProcessorEnv,
  fetchFn: typeof fetch = fetch,
): Promise<Response> {
  const origin = request.headers.get("origin");
  const originAllowed = Boolean(origin && allowedOrigins(env.ARTIFACT_ALLOWED_ORIGINS).has(origin));
  if (request.method === "OPTIONS") {
    return originAllowed
      ? new Response(null, { status: 204, headers: responseHeaders(origin) })
      : json(403, { error: "origin_not_allowed" });
  }
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!configured(env)) return json(503, { error: "artifact_scanner_not_configured" });
  if (!originAllowed) {
    return json(403, { error: "origin_not_allowed" });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json(401, { error: "authentication_required" }, origin);
  }

  const userResponse = await fetchFn(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      authorization,
    },
  });
  if (!userResponse.ok) return json(401, { error: "invalid_session" }, origin);
  const user = (await userResponse.json()) as { id?: string };
  if (!user.id) return json(401, { error: "invalid_session" }, origin);

  let artifactId = "";
  try {
    const body = (await request.json()) as { artifactId?: unknown };
    artifactId = typeof body.artifactId === "string" ? body.artifactId.trim() : "";
  } catch {
    return json(400, { error: "invalid_json" }, origin);
  }
  if (!/^[0-9a-f-]{36}$/i.test(artifactId)) {
    return json(400, { error: "invalid_artifact_id" }, origin);
  }

  const artifactResponse = await fetchFn(
    `${env.SUPABASE_URL}/rest/v1/document_artifacts?id=eq.${encodeURIComponent(artifactId)}&select=id,owner_user_id,bucket,storage_key,byte_size,checksum_sha256,scan_status`,
    { headers: serviceHeaders(env) },
  );
  if (!artifactResponse.ok) return json(502, { error: "artifact_lookup_failed" }, origin);
  const records = (await artifactResponse.json()) as ArtifactRecord[];
  const artifact = records[0];
  if (!artifact || artifact.owner_user_id !== user.id) {
    return json(404, { error: "artifact_not_found" }, origin);
  }
  if (artifact.scan_status === "clean" || artifact.scan_status === "infected") {
    return json(200, { artifactId, status: artifact.scan_status, idempotent: true }, origin);
  }
  if (artifact.byte_size < 1 || artifact.byte_size > MAX_ARTIFACT_BYTES) {
    return json(422, { error: "artifact_size_out_of_bounds" }, origin);
  }

  const signedUrlResponse = await fetchFn(
    `${env.SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(artifact.bucket)}/${artifact.storage_key
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`,
    {
      method: "POST",
      headers: serviceHeaders(env),
      body: JSON.stringify({ expiresIn: 120 }),
    },
  );
  if (!signedUrlResponse.ok) return json(502, { error: "signed_url_failed" }, origin);
  const signed = (await signedUrlResponse.json()) as { signedURL?: string; signedUrl?: string };
  const signedPath = signed.signedURL ?? signed.signedUrl;
  if (!signedPath) return json(502, { error: "signed_url_missing" }, origin);
  const downloadUrl = new URL(signedPath, env.SUPABASE_URL).toString();

  await markArtifact(
    env,
    artifactId,
    { processing_status: "scan_pending", scan_status: "pending" },
    fetchFn,
  );

  let scanResponse: Response;
  try {
    scanResponse = await fetchFn(`${env.ARTIFACT_SCANNER_URL?.replace(/\/$/, "")}/v1/scan-url`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.ARTIFACT_SCANNER_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        url: downloadUrl,
        expectedSha256: artifact.checksum_sha256,
        expectedBytes: artifact.byte_size,
      }),
    });
  } catch {
    await markArtifact(
      env,
      artifactId,
      { scan_status: "external_blocked", processing_status: "quarantined" },
      fetchFn,
    );
    return json(502, { error: "scanner_unreachable" }, origin);
  }

  if (!scanResponse.ok) {
    await markArtifact(
      env,
      artifactId,
      { scan_status: "failed", processing_status: "failed" },
      fetchFn,
    );
    return json(502, { error: "scanner_failed", upstreamStatus: scanResponse.status }, origin);
  }

  const result = (await scanResponse.json()) as Partial<ScannerResult>;
  if (
    (result.status !== "clean" && result.status !== "infected")
    || result.sha256 !== artifact.checksum_sha256
    || typeof result.scanner !== "string"
  ) {
    await markArtifact(
      env,
      artifactId,
      { scan_status: "failed", processing_status: "failed" },
      fetchFn,
    );
    return json(502, { error: "scanner_result_invalid" }, origin);
  }

  const scannedAt = new Date().toISOString();
  const persisted = await markArtifact(
    env,
    artifactId,
    result.status === "clean"
      ? {
          scan_status: "clean",
          processing_status: "needs_human_review",
          scanner_provider: result.scanner,
          scanner_result_id: result.sha256,
          scanned_at: scannedAt,
        }
      : {
          scan_status: "infected",
          processing_status: "failed",
          scanner_provider: result.scanner,
          scanner_result_id: result.signature ?? result.sha256,
          scanned_at: scannedAt,
        },
    fetchFn,
  );
  if (!persisted) return json(502, { error: "scan_result_persist_failed" }, origin);

  return json(200, {
    artifactId,
    status: result.status,
    signature: result.status === "infected" ? result.signature : undefined,
  }, origin);
}
